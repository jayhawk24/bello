import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/webPush";

export async function GET() {
    const publicKey = getVapidPublicKey();
    if (!publicKey)
        return NextResponse.json(
            { success: false, error: "vapid_not_configured" },
            { status: 500 }
        );
    return NextResponse.json({ success: true, publicKey });
}
