import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    notificationService,
    type Notification,
    type CreateNotificationData,
    type NotificationFilters
} from "@/services";

// Query Keys
export const notificationKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationKeys.all, "list"] as const,
    list: (filters: NotificationFilters = {}) =>
        [...notificationKeys.lists(), filters] as const,
    unreadCount: () => [...notificationKeys.all, "unread-count"] as const
};

// Get notifications
export function useNotifications(filters?: NotificationFilters) {
    return useQuery({
        queryKey: notificationKeys.list(filters),
        queryFn: () => notificationService.getNotifications(filters),
        // Refetch more frequently for notifications
        staleTime: 30 * 1000 // 30 seconds
    });
}

// Get unread notifications count
export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: () => notificationService.getUnreadCount(),
        // Keep count fresh
        staleTime: 10 * 1000, // 10 seconds
        refetchInterval: 30 * 1000 // Auto refetch every 30 seconds
    });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({
                queryKey: notificationKeys.lists()
            });

            // Optimistically update the notification
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    return old.map((notification: Notification) =>
                        notification.id === id
                            ? { ...notification, isRead: true }
                            : notification
                    );
                }
            );

            // Update unread count
            queryClient.setQueryData(
                notificationKeys.unreadCount(),
                (old: any) => {
                    if (typeof old === "number" && old > 0) {
                        return old - 1;
                    }
                    return old;
                }
            );

            return { previousData };
        },
        onError: (err, id, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
    });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({
                queryKey: notificationKeys.lists()
            });

            // Optimistically update all notifications
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    return old.map((notification: Notification) => ({
                        ...notification,
                        isRead: true
                    }));
                }
            );

            // Update unread count to 0
            queryClient.setQueryData(notificationKeys.unreadCount(), 0);

            return { previousData };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
    });
}

// Delete notification
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.deleteNotification(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({
                queryKey: notificationKeys.lists()
            });

            // Get the notification to check if it was unread
            const currentData = queryClient.getQueriesData({
                queryKey: notificationKeys.lists()
            });
            let wasUnread = false;

            for (const [, data] of currentData) {
                if (Array.isArray(data)) {
                    const notification = data.find(
                        (n: Notification) => n.id === id
                    );
                    if (notification && !notification.isRead) {
                        wasUnread = true;
                        break;
                    }
                }
            }

            // Optimistically remove the notification
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;
                    return old.filter(
                        (notification: Notification) => notification.id !== id
                    );
                }
            );

            // Update unread count if the deleted notification was unread
            if (wasUnread) {
                queryClient.setQueryData(
                    notificationKeys.unreadCount(),
                    (old: any) => {
                        if (typeof old === "number" && old > 0) {
                            return old - 1;
                        }
                        return old;
                    }
                );
            }

            return { previousData };
        },
        onError: (err, id, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
    });
}

// Create notification (admin only)
export function useCreateNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateNotificationData) =>
            notificationService.createNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
    });
}
