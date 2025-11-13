import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return NextResponse.json(
                { success: false, error: "unauthorized" },
                { status: 401 }
            );

        const body = await req.json();
        const deviceToken = body?.deviceToken as string | undefined;
        const platform = (body?.platform as string | undefined) || "unknown";
        if (!deviceToken)
            return NextResponse.json(
                { success: false, error: "missing_device_token" },
                { status: 400 }
            );

        await prisma.deviceToken.upsert({
            where: { token: deviceToken },
            create: { token: deviceToken, platform, userId },
            update: { userId, platform }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("device-token register error", e);
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const deviceToken = searchParams.get("deviceToken");
        if (!deviceToken)
            return NextResponse.json(
                { success: false, error: "missing_device_token" },
                { status: 400 }
            );
        await prisma.deviceToken
            .delete({ where: { token: deviceToken } })
            .catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("device-token delete error", e);
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}
