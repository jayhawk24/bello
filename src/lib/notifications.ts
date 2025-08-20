import { prisma } from '@/lib/prisma';

export interface NotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
}

// Create a notification in the database
export async function createNotification(notificationData: NotificationData) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: notificationData.userId,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data || {},
                isRead: false
            }
        });

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
}

// Get all staff users for a hotel
export async function getHotelStaff(hotelId: string) {
    try {
        const staffUsers = await prisma.user.findMany({
            where: {
                hotelId,
                role: {
                    in: ['hotel_staff', 'hotel_admin']
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return staffUsers;
    } catch (error) {
        console.error('Failed to get hotel staff:', error);
        throw error;
    }
}

// Create notifications for all staff members
export async function notifyHotelStaff(hotelId: string, notification: Omit<NotificationData, 'userId'>) {
    try {
        const staffUsers = await getHotelStaff(hotelId);
        
        const notifications = await Promise.all(
            staffUsers.map(user => 
                createNotification({
                    ...notification,
                    userId: user.id
                })
            )
        );

        return notifications;
    } catch (error) {
        console.error('Failed to notify hotel staff:', error);
        throw error;
    }
}

// Send push notification to staff
export async function sendPushNotificationToStaff(hotelId: string, notification: {
    title: string;
    message: string;
    data?: any;
}) {
    // In a production environment, you would use web-push to send notifications
    // For now, we'll simulate this and focus on the database notifications
    console.log(`Push notification sent to hotel ${hotelId} staff:`, notification);
    
    // Here you would typically:
    // 1. Get push subscriptions for hotel staff from database
    // 2. Use web-push to send notifications to each subscription
    // 3. Handle any failed deliveries
    
    return true;
}

// Service request notification helpers
export async function notifyStaffNewServiceRequest(serviceRequest: {
    id: string;
    title: string;
    priority: string;
    hotelId: string;
    guest: {
        name: string;
    };
    room: {
        roomNumber: string;
    };
    service: {
        name: string;
        category: string;
    };
}) {
    const notificationData = {
        type: 'service_request_created',
        title: `🔔 New ${serviceRequest.priority} priority request`,
        message: `${serviceRequest.guest.name} in Room ${serviceRequest.room.roomNumber} requested ${serviceRequest.service.name}: "${serviceRequest.title}"`,
        data: {
            serviceRequestId: serviceRequest.id,
            priority: serviceRequest.priority,
            roomNumber: serviceRequest.room.roomNumber,
            serviceName: serviceRequest.service.name,
            category: serviceRequest.service.category
        }
    };

    try {
        // Create database notifications for all staff
        const notifications = await notifyHotelStaff(serviceRequest.hotelId, notificationData);

        // Send push notifications (in production)
        await sendPushNotificationToStaff(serviceRequest.hotelId, {
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data
        });

        console.log(`Created ${notifications.length} notifications for new service request`);
        return notifications;
    } catch (error) {
        console.error('Failed to notify staff of new service request:', error);
        throw error;
    }
}

// Get unread notifications for a user
export async function getUserNotifications(userId: string, limit = 10) {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return notifications;
    } catch (error) {
        console.error('Failed to get user notifications:', error);
        throw error;
    }
}

// Mark notification as read
export async function markNotificationRead(notificationId: string, userId: string) {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId // Ensure user owns the notification
            },
            data: {
                isRead: true
            }
        });

        return notification;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
    }
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(userId: string) {
    try {
        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return result;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
}
