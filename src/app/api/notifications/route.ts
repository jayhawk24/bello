import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getUserNotifications,
    markAllNotificationsRead,
    markNotificationRead
} from "@/lib/notifications";

async function getUserId(req: NextRequest): Promise<string | null> {
    const userId = req.headers.get("x-user-id");
    if (userId) return userId;
    try {
        const session: any = await getServerSession(authOptions as any);
        return session?.user?.id || null;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return NextResponse.json(
                { success: false, error: "unauthorized" },
                { status: 401 }
            );

        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get("limit") || "10";
        const limit = Math.min(Math.max(parseInt(limitStr, 10) || 10, 1), 100);
        const notifications = await getUserNotifications(userId, limit);
        return NextResponse.json({ success: true, notifications });
    } catch (e) {
        console.error("notifications GET error", e);
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return NextResponse.json(
                { success: false, error: "unauthorized" },
                { status: 401 }
            );
        const body = await req.json();
        if (body?.markAllAsRead) {
            const result = await markAllNotificationsRead(userId);
            return NextResponse.json({ success: true, count: result.count });
        }
        const notificationId = body?.notificationId as string | undefined;
        if (!notificationId)
            return NextResponse.json(
                { success: false, error: "missing_notification_id" },
                { status: 400 }
            );
        const notification = await markNotificationRead(notificationId, userId);
        return NextResponse.json({ success: true, notification });
    } catch (e) {
        console.error("notifications PATCH error", e);
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}
