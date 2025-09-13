"use client";

class NotificationService {
    private static instance: NotificationService;
    private swRegistration: ServiceWorkerRegistration | null = null;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Initialize the service worker and request notification permissions
    public async initialize(): Promise<boolean> {
        if (typeof window === 'undefined') {
            return false;
        }

        try {
            // Check if notifications are supported
            if (!('Notification' in window)) {
                console.log('This browser does not support notifications');
                return false;
            }

            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.log('This browser does not support service workers');
                return false;
            }

            // Request notification permission
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return false;
            }

            // Register service worker
            await this.registerServiceWorker();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize notification service:', error);
            return false;
        }
    }

    // Request notification permission
    public async requestPermission(): Promise<NotificationPermission> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'denied';
        }

        let permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        return permission;
    }

    // Register service worker
    private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.swRegistration = registration;
            console.log('Service Worker registered successfully');
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }

    // Handle messages from service worker
    private handleServiceWorkerMessage = (event: MessageEvent) => {
        const data = event.data as any;
        if (data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
            // try to re-sync the subscription
            this.ensureSubscribed();
        }
    };

    // Show a local notification (only when Push is unavailable)
    public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        const permission = await this.requestPermission();
        if (permission !== 'granted') {
            return;
        }

        const defaultOptions: NotificationOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            requireInteraction: true,
            ...options
        };

        try {
            // Avoid SW-based OS toast when push is enabled; only fallback to local Notification API
            if (!this.swRegistration) {
                new Notification(title, defaultOptions);
            }
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    // Poll for new notifications
    public async pollNotifications(): Promise<void> {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                const notifications = data.notifications || [];
                
                // Process new notifications
                this.processNotifications(notifications);
            }
        } catch (error) {
            console.error('Failed to poll notifications:', error);
        }
    }

    // Process notifications and show them
    private processNotifications(notifications: any[]): void {
        // Update UI (badge/list) elsewhere; do NOT create OS toasts from polling to avoid duplicates
        // Future: emit an event or call a callback to update in-app UI
    }

    // Start polling for notifications
    public startPolling(interval: number = 30000): void {
        // Poll immediately
        this.pollNotifications();
        
        // Then poll at intervals
        setInterval(() => {
            this.pollNotifications();
        }, interval);
    }

    // Ensure push subscription exists for current user
    public async ensureSubscribed(): Promise<void> {
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        try {
            const reg = await navigator.serviceWorker.ready;
            const existing = await reg.pushManager.getSubscription();
            if (existing) {
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: existing.endpoint,
                        keys: (existing as any).toJSON().keys,
                        userAgent: navigator.userAgent,
                    }),
                });
                return;
            }

            const res = await fetch('/api/push/public-key');
            const { publicKey } = await res.json();
            if (!publicKey) return;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: sub.endpoint,
                    keys: (sub as any).toJSON().keys,
                    userAgent: navigator.userAgent,
                }),
            });
        } catch (e) {
            console.error('ensureSubscribed error', e);
        }
    }

    // Mark notification as read
    public async markAsRead(notificationId: string): Promise<void> {

// helpers
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notificationId })
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    // Mark all notifications as read
    public async markAllAsRead(): Promise<void> {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ markAllAsRead: true })
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }
}

export default NotificationService;

// helpers
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
