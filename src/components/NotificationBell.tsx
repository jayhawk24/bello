"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NotificationService from '@/lib/notificationService';

interface NotificationType {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    data: any;
    createdAt: string;
}


const NotificationBell = () => {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
    const [pushEnabled, setPushEnabled] = useState(false);
    // Check notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Detect if a push subscription currently exists on this device
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                    if (mounted) setPushEnabled(false);
                    return;
                }
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                if (mounted) setPushEnabled(!!sub);
            } catch {
                if (mounted) setPushEnabled(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [notificationPermission]);

    // Handler to request notification permission
    const handleEnableNotifications = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        try {
            // Use centralized service to register SW and subscribe
            const service = NotificationService.getInstance();
            const initialized = await service.initialize();
            setNotificationPermission(Notification.permission);
            if (initialized) {
                await service.ensureSubscribed();
                // refresh local flag
                try {
                    const reg = await navigator.serviceWorker.ready;
                    const sub = await reg.pushManager.getSubscription();
                    setPushEnabled(!!sub);
                } catch { }
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleDisablePush = async () => {
        if (typeof window === 'undefined') return;
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                try {
                    await fetch('/api/push/unsubscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: sub.endpoint }),
                    });
                } catch { }
                await sub.unsubscribe();
                setPushEnabled(false);
            }
        } catch (e) {
            console.log(e);
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!session?.user) return;

        try {
            const response = await fetch('/api/notifications?limit=20');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.notifications?.filter((n: NotificationType) => !n.isRead).length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notificationId })
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ markAllAsRead: true })
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
            return;
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [session]);

    // Don't show for non-staff users
    if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
        return null;
    }

    const formatTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const getPriorityIcon = (data: any) => {
        if (data?.priority === 'high') return '🚨';
        if (data?.priority === 'medium') return '⚠️';
        if (data?.priority === 'low') return 'ℹ️';
        return '🔔';
    };


    return (
        <div className="relative">

            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-minion-yellow rounded-lg transition-colors"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Notification Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-minion-blue hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${pushEnabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                                {pushEnabled ? '🔔 Push enabled on this device' : '🔕 Push disabled on this device'}
                            </span>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="text-2xl mb-2">🔔</div>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            markAsRead(notification.id);
                                        }
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-lg flex-shrink-0">
                                            {getPriorityIcon(notification.data)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTime(notification.createdAt)}
                                                {notification.data?.roomNumber && (
                                                    <span className="ml-2">• Room {notification.data.roomNumber}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = '/dashboard/staff-requests';
                                }}
                                className="text-sm text-minion-blue hover:underline"
                            >
                                View all requests
                            </button>
                        </div>
                    )}

                    {/* Enable notifications prompt when permission not granted */}
                    {notificationPermission === 'default' || notificationPermission === 'denied' ? (
                        <div className=" ml-2 mr-2 mb-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <span className="text-yellow-600">🔔</span>
                            <span className="text-sm text-yellow-800">Enable browser notifications for real-time alerts.</span>
                            <button
                                onClick={handleEnableNotifications}
                                className="ml-auto px-2 py-1 text-xs bg-yellow-400 text-yellow-800 rounded hover:bg-yellow-500"
                            >
                                Enable
                            </button>
                        </div>
                    ) : null}

                    {/* Disable push on this device (permission stays granted) */}
                    {notificationPermission === 'granted' && pushEnabled ? (
                        <div className=" ml-2 mr-2 mb-2 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2">
                            <span className="text-gray-600">🛑</span>
                            <span className="text-sm text-gray-800">Disable push on this device (you can re-enable anytime).</span>
                            <button
                                onClick={handleDisablePush}
                                className="ml-auto px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Disable
                            </button>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default NotificationBell;
