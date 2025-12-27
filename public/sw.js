// Service Worker for push notifications
const CACHE_NAME = 'stayscan-notifications-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push received:', event);

    if (!event.data) {
        console.log('No data in push event');
        return;
    }

    let data;
    try {
        data = event.data.json();
    } catch (error) {
        console.error('Failed to parse push data:', error);
        data = { title: 'New Notification', body: event.data.text() };
    }

    const options = {
        body: data.body || data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || (data.data && (data.data.serviceRequestId || data.data.id) ? `sr-${data.data.serviceRequestId || data.data.id}` : 'service-request'),
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Request'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        data: data.data || {}
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        // Open the staff dashboard
        event.waitUntil(
            self.clients.openWindow('/dashboard/staff-requests')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open staff dashboard
        event.waitUntil(
            self.clients.openWindow('/dashboard/staff-requests')
        );
    }
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
    if (event.tag === 'notification-sync') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    try {
        const response = await fetch('/api/notifications/sync', {
            method: 'POST'
        });
        console.log('Notifications synced:', response.ok);
    } catch (error) {
        console.error('Failed to sync notifications:', error);
    }
}
