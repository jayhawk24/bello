## Goal

Replace the existing notifications flow with an idempotent, VAPID-based Web Push system and a clean service worker that guarantees one-and-only-one OS notification per event per recipient. Keep DB notifications as the source of truth and use polling only as a non-OS fallback (no duplicate OS toasts). Maintain PWA installability work as a separate track.

## Current issues to fix

-   Duplicate notifications are delivered because multiple paths trigger OS toasts:
    -   The current SW `push` handler and the client polling-based `showNotification()` both display toasts.
    -   Backend triggers can run more than once per event (e.g., multiple code paths or retries), creating duplicate DB rows and pushes.
    -   SW does not coalesce duplicates (no stable tag/id) and includes extra logic (`sync`) that’s not needed for pushes.

## Success criteria

-   For a guest request, each staff/admin receives at most one OS notification per request.
-   Repeated triggers (retries, concurrent calls) do not create additional DB notifications or pushes.
-   Polling shows in-app UI updates only (badge/list) and never triggers OS toasts when Push is enabled/available.
-   Subscriptions are stored, pruned on 404/410, and opt-in/out is visible in the UI.

## Phased plan (notifications only)

### Phase N1 — Remove flawed SW logic and consolidate responsibility

-   Remove the current `public/sw.js` file and replace it with a minimal worker dedicated to push and click only (no `sync`, no client-side polling integration, no extra caching yet).
-   New SW responsibilities:
    -   `push` → show a notification only if payload contains a stable `eventKey` and coalesces using `tag=eventKey`.
    -   `notificationclick` → navigate to the appropriate URL.
    -   `pushsubscriptionchange` → attempt to resubscribe and inform the app to refresh server-side subscription.

Acceptance:

-   SW does not display a notification without a valid payload `eventKey`. Identical `eventKey` replaces/ignores duplicates client-side.

### Phase N2 — Data model for idempotency and delivery safety

-   Add push subscription storage (new table):

```
model PushSubscription {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  endpoint    String   @unique
  p256dh      String
  auth        String
  userAgent   String?  @map("user_agent")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  lastUsedAt  DateTime? @map("last_used_at")
  isActive    Boolean  @default(true) @map("is_active")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_subscriptions")
}
```

-   Add idempotency to notifications with a stable event key:

    -   Extend `Notification` with `eventKey String? @map("event_key")` and a composite uniqueness `@@unique([userId, eventKey])`.
    -   For service requests, define `eventKey = service_request:<requestId>:created` (or `<requestId>:status_change:<status>` for updates).

-   Optional (for auditing/resends): add `NotificationDelivery` mapping `notificationId + subscriptionId` with unique composite to avoid multiple sends to the same endpoint.

Acceptance:

-   Creating the same event twice (even concurrently) results in exactly one `Notification` row per user.

### Phase N3 — VAPID push pipeline and APIs

-   Generate and store VAPID envs: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
-   Add `src/lib/push.ts`:
    -   `initWebPush()` sets VAPID details once.
    -   `sendPushToUser(userId, payload, eventKey)`:
        -   Load active subscriptions; iterate and call `webPush.sendNotification`.
        -   On 404/410, deactivate the subscription.
        -   Use `eventKey` to keep payload stable (SW will coalesce via `tag`).
    -   `sendPushToUsers(userIds, payload, eventKey)` batched.
-   API routes under `src/app/api/push`:
    -   `GET /api/push/public-key`.
    -   `POST /api/push/subscribe` (auth) → upsert by endpoint.
    -   `POST /api/push/unsubscribe` (auth) → deactivate/remove by endpoint.
    -   `POST /api/push/test` (auth, dev only) → send to caller.

Acceptance:

-   A subscribed user can receive a test push exactly once per test trigger.

### Phase N4 — Server-side idempotent triggers

-   In `src/lib/notifications.ts`:
    -   Replace `sendPushNotificationToStaff()` with an idempotent path:
        1. Build `eventKey` from the source (e.g., `service_request:<id>:created`).
        2. For each recipient, UPSERT `Notification` using the unique `[userId, eventKey]` constraint.
        3. If created (not found), enqueue/send push with the same `eventKey`.
        4. If already exists, do not send again.
    -   For bulk, use `createMany({ skipDuplicates: true })` after adding the unique constraint, or loop upserts.
-   Ensure this function is invoked from a single canonical place when a request is created, to avoid multiple triggers.

Acceptance:

-   Triggering a service request once results in 1 DB notification per recipient and at most 1 push per device.

### Phase N5 — Client lifecycle and duplicate prevention

-   In `src/lib/notificationService.ts`:
    -   After registering the SW and obtaining permission, subscribe with `PushManager` using the server’s public VAPID key and POST to `/api/push/subscribe`.
    -   Add `ensureSubscribed()` on app start; handle logout/unsubscribe cleanup.
    -   IMPORTANT: When Push is available and permission is granted, DO NOT call `showNotification()` for polled items. Polling should update the UI only (badge/list), not create OS toasts. This removes the double-toast issue.
-   Add a user-facing toggle “Enable push notifications”.

Acceptance:

-   With push enabled, OS toasts are delivered via SW only; polling never creates OS toasts.

### Phase N6 — SW coalescing rules (client-side dedupe)

-   In the new `public/sw.js`:
    -   Parse push payload and require `eventKey`.
    -   Use `tag: eventKey` to coalesce repeat pushes for the same event.
    -   Optionally check existing notifications via `self.registration.getNotifications({ tag: eventKey })` to skip re-showing.
    -   Avoid `requireInteraction` unless product requires it; keep UX minimal.

Acceptance:

-   Replayed or delayed pushes with the same `eventKey` don’t create multiple visible toasts.

### Phase N7 — Observability and cleanup

-   Add structured logs around subscribe/unsubscribe/send attempts and failures.
-   Nightly/weekly job to prune inactive subscriptions.
-   Add rate-limit/aggregation (optional): if multiple requests occur within a short window, coalesce into a single “You have N new requests” push; keep details in-app.

## Minimal PWA track (kept separate from duplicates fix)

-   Add `public/manifest.webmanifest` with icons; link in `app/layout.tsx`.
-   Keep SW dedicated to push for now; add offline caching later (Workbox/next-pwa) once notifications are stable to avoid reintroducing complexity.
-   Basic Lighthouse PWA checks: manifest valid, installable, service worker present.

## Security and privacy

-   Auth required for subscribe/unsubscribe; subscriptions tied to `User.id`.
-   Push payloads contain minimal data plus `eventKey`; details resolved in-app on click.
-   HTTPS only; prune invalid endpoints.

## Testing checklist (duplicates focus)

-   DB: Unique `[userId, eventKey]` prevents duplicate rows; concurrent triggers tested.
-   API: Subscribe/unsubscribe flows verified; 404/410 deactivation tested.
-   E2E:
    -   Create a service request once → each intended recipient gets exactly one OS toast.
    -   Trigger the creation endpoint twice rapidly → still one toast per recipient.
    -   With Push enabled, polling updates the bell but does not create OS toasts.
    -   Resubscribe after SW update (`pushsubscriptionchange`) works.

## Timeline (estimate)

-   N1–N2 (SW rewrite + schema): 0.5–1 day
-   N3–N4 (VAPID APIs + idempotent triggers): 1–1.5 days
-   N5–N6 (client lifecycle + coalescing): 0.5–1 day
-   N7 (observability + cleanup): 0.5 day
    Total: ~2.5–4 days including tests.

## Requirement coverage

-   Remove flawed SW and prevent duplicate notifications: Addressed in N1, N4, N5, N6.
-   Switch to VAPID push: Addressed in N3 with key management and APIs.
-   Keep PWA compatibility as a separate, minimal track without reintroducing duplicates.
