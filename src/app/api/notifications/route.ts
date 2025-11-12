import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";
import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "@/lib/notifications";

// Get user notifications
async function getUserId(request: NextRequest) {
    // Prefer NextAuth session
    // Middleware-injected headers first
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) return headerUserId;

    const session = await auth();
    if (session?.user?.id) return session.user.id;

    const authHeader =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
            const payload = await verifyAccessToken<{
                role: string;
                hotelId?: string;
            }>(token);
            return payload.sub;
        } catch {}
    }
    return null;
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        const notifications = await getUserNotifications(userId, limit);

        return NextResponse.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Mark notification as read or mark all as read
export async function PATCH(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { notificationId, markAllAsRead } = body;

        if (markAllAsRead) {
            const result = await markAllNotificationsRead(userId);
            return NextResponse.json({
                success: true,
                message: "All notifications marked as read",
                count: result.count
            });
        }

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        const notification = await markNotificationRead(notificationId, userId);

        return NextResponse.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error("Update notification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
