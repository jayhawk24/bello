import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { endpoint, keys } = body || {};
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { success: false, error: "invalid_subscription" },
                { status: 400 }
            );
        }

        let userId = req.headers.get("x-user-id");
        if (!userId) {
            const session: any = await getServerSession(authOptions as any);
            userId = session?.user?.id;
        }
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "unauthorized" },
                { status: 401 }
            );
        }

        const userAgent = req.headers.get("user-agent") || undefined;

        // Upsert by endpoint
        await prisma.webPushSubscription.upsert({
            where: { endpoint },
            create: {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userId,
                userAgent
            },
            update: { p256dh: keys.p256dh, auth: keys.auth, userId, userAgent }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("subscribe error", e);
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}
