import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

async function getUserIdFromRequest(request: NextRequest) {
    // Middleware-injected user id first
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
        } catch (_) {
            return null;
        }
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { deviceToken, platform } = body;
        if (!deviceToken) {
            return NextResponse.json(
                { error: "deviceToken required" },
                { status: 400 }
            );
        }

        const normalizedPlatform =
            typeof platform === "string" ? platform : "android";

        const record = await prisma.deviceToken.upsert({
            where: { token: deviceToken },
            update: { userId, platform: normalizedPlatform },
            create: {
                token: deviceToken,
                userId,
                platform: normalizedPlatform
            }
        });

        return NextResponse.json({ success: true, deviceToken: record.token });
    } catch (error) {
        console.error("Register device token error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const { searchParams } = new URL(request.url);
        const deviceToken = searchParams.get("deviceToken");
        if (!deviceToken) {
            return NextResponse.json(
                { error: "deviceToken query param required" },
                { status: 400 }
            );
        }
        await prisma.deviceToken
            .delete({ where: { token: deviceToken } })
            .catch(() => {});
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete device token error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
