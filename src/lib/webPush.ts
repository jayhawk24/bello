import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

let configured = false;

export function getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
}

export function ensureWebPushConfigured() {
    if (configured) return;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn(
            "[webpush] Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
        );
        return;
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    configured = true;
}

export async function sendWebPush(
    subscription: any,
    payload: Record<string, any>
) {
    ensureWebPushConfigured();
    return webpush.sendNotification(subscription, JSON.stringify(payload));
}
