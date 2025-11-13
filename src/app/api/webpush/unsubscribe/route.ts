import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const endpoint = body?.endpoint;
        if (!endpoint)
            return NextResponse.json(
                { success: false, error: "missing_endpoint" },
                { status: 400 }
            );
        await prisma.webPushSubscription
            .delete({ where: { endpoint } })
            .catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: "server_error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");
    if (!endpoint)
        return NextResponse.json(
            { success: false, error: "missing_endpoint" },
            { status: 400 }
        );
    await prisma.webPushSubscription
        .delete({ where: { endpoint } })
        .catch(() => {});
    return NextResponse.json({ success: true });
}
