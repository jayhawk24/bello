"use client";

class NotificationService {
    private static instance: NotificationService;
    private swRegistration: ServiceWorkerRegistration | null = null;
    private subscribed = false;
    // Polling removed; rely solely on Push API (VAPID)

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Initialize the service worker and request notification permissions
    public async initialize(): Promise<boolean> {
        if (typeof window === "undefined") {
            return false;
        }

        try {
            // Check if notifications are supported
            if (!("Notification" in window)) {
                console.log("This browser does not support notifications");
                return false;
            }

            // Check if service workers are supported
            if (!("serviceWorker" in navigator)) {
                console.log("This browser does not support service workers");
                return false;
            }

            // Request notification permission
            const permission = await this.requestPermission();
            if (permission !== "granted") {
                console.log("Notification permission denied");
                return false;
            }

            // Register service worker
            await this.registerServiceWorker();

            // Subscribe to push via VAPID
            await this.subscribeToPush();

            return true;
        } catch (error) {
            console.error("Failed to initialize notification service:", error);
            return false;
        }
    }

    // Request notification permission
    public async requestPermission(): Promise<NotificationPermission> {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return "denied";
        }

        let permission = Notification.permission;

        if (permission === "default") {
            permission = await Notification.requestPermission();
        }

        return permission;
    }

    // Register service worker
    private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        try {
            const registration = await navigator.serviceWorker.register(
                "/sw.js"
            );
            this.swRegistration = registration;
            console.log("Service Worker registered successfully");

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener(
                "message",
                this.handleServiceWorkerMessage
            );

            return registration;
        } catch (error) {
            console.error("Service Worker registration failed:", error);
            return null;
        }
    }

    private async getVapidPublicKey(): Promise<string | null> {
        try {
            const res = await fetch("/api/webpush/public-key");
            if (!res.ok) return null;
            const data = await res.json();
            return data.publicKey || null;
        } catch {
            return null;
        }
    }

    private urlBase64ToUint8Array(base64String: string) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const rawData =
            typeof window !== "undefined"
                ? window.atob(base64)
                : Buffer.from(base64, "base64").toString("binary");
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    public async subscribeToPush(): Promise<boolean> {
        if (!this.swRegistration) return false;
        if (this.subscribed) return true;
        try {
            const publicKey = await this.getVapidPublicKey();
            if (!publicKey) {
                console.warn("VAPID public key missing; web push disabled");
                return false;
            }
            const existing =
                await this.swRegistration.pushManager.getSubscription();
            const subscription =
                existing ||
                (await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(publicKey)
                }));
            await fetch("/api/webpush/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription)
            });
            this.subscribed = true;
            // If we were polling as a fallback, stop once push is active
            this.stopPolling();
            return true;
        } catch (e) {
            console.error("Failed to subscribe to push", e);
            return false;
        }
    }

    public async unsubscribeFromPush(): Promise<void> {
        if (!this.swRegistration) return;
        try {
            const sub = await this.swRegistration.pushManager.getSubscription();
            if (sub) {
                const endpoint = sub.endpoint;
                await sub.unsubscribe();
                await fetch("/api/webpush/unsubscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint })
                });
                this.subscribed = false;
            }
        } catch (e) {
            console.error("Failed to unsubscribe push", e);
        }
    }

    public isPushActive(): boolean {
        return this.subscribed;
    }

    // Handle messages from service worker
    private handleServiceWorkerMessage = (event: MessageEvent) => {
        console.log("Message from service worker:", event.data);
        // Handle any messages from the service worker here
    };

    // Show a local notification
    public async showNotification(
        title: string,
        options: NotificationOptions = {}
    ): Promise<void> {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return;
        }

        const permission = await this.requestPermission();
        if (permission !== "granted") {
            return;
        }

        const defaultOptions: NotificationOptions = {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            requireInteraction: true,
            ...options
        };

        try {
            if (this.swRegistration) {
                // Show notification via service worker
                await this.swRegistration.showNotification(
                    title,
                    defaultOptions
                );
            } else {
                // Fallback to regular notification
                new Notification(title, defaultOptions);
            }
        } catch (error) {
            console.error("Failed to show notification:", error);
        }
    }

    // Polling fully removed
    public startPolling(_interval: number = 30000): void {
        /* no-op: polling removed */
    }
    public stopPolling(): void {
        /* no-op: polling removed */
    }

    // Mark notification as read
    public async markAsRead(notificationId: string): Promise<void> {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notificationId })
            });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }

    // Mark all notifications as read
    public async markAllAsRead(): Promise<void> {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ markAllAsRead: true })
            });
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    }
}

export default NotificationService;
