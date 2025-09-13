// Minimal Service Worker dedicated to Web Push notifications

self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

// Coalesce duplicates using a stable eventKey → tag
self.addEventListener('push', (event) => {
    if (!event.data) return
    let data
    try {
        data = event.data.json()
    } catch {
        data = { title: 'Notification', body: String(event.data) }
    }

    const title = data.title || 'Notification'
    const eventKey = data.eventKey || data.tag
    if (!eventKey) {
        // Do not display if we cannot identify the event
        return
    }

    const options = {
        body: data.body || data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: eventKey,
        data: { ...(data.data || {}), eventKey },
    }

    event.waitUntil(
        (async () => {
            // Avoid showing multiple identical notifications
            const existing = await self.registration.getNotifications({ tag: eventKey })
            if (existing && existing.length) return
            await self.registration.showNotification(title, options)
        })(),
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const target = event.notification?.data?.target || '/dashboard/staff-requests'
    event.waitUntil(self.clients.openWindow(target))
})

// Attempt resubscription on key changes
self.addEventListener('pushsubscriptionchange', async () => {
    const reg = await self.registration
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    // Notify clients to refresh subscription server-side
    const clients = await self.clients.matchAll({ includeUncontrolled: true })
    clients.forEach((c) => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }))
})
