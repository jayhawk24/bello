import { api } from "./api";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    userId: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, any>;
}

export interface CreateNotificationData {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    userId: string;
    data?: Record<string, any>;
}

export interface NotificationFilters {
    isRead?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
}

export const notificationService = {
    // Get user notifications
    getNotifications: (filters?: NotificationFilters) =>
        api.get("/notifications", { params: filters }),

    // Mark notification as read
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

    // Mark all notifications as read
    markAllAsRead: () => api.patch("/notifications/read-all"),

    // Create notification (admin only)
    createNotification: (data: CreateNotificationData) =>
        api.post("/notifications", data),

    // Delete notification
    deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

    // Get unread count
    getUnreadCount: () => api.get("/notifications/unread-count")
};
