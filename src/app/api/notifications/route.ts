import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications';

// Get user notifications
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const notifications = await getUserNotifications(session.user.id, limit);

        return NextResponse.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Mark notification as read or mark all as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { notificationId, markAllAsRead } = body;

        if (markAllAsRead) {
            const result = await markAllNotificationsRead(session.user.id);
            return NextResponse.json({
                success: true,
                message: 'All notifications marked as read',
                count: result.count
            });
        }

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        const notification = await markNotificationRead(notificationId, session.user.id);

        return NextResponse.json({
            success: true,
            notification
        });

    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
