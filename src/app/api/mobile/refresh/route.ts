import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json();
        if (!refreshToken || typeof refreshToken !== "string") {
            return NextResponse.json(
                { error: "refreshToken required" },
                { status: 400 }
            );
        }

        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "Invalid or expired refresh token" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: stored.userId }
        });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const accessToken = await signAccessToken({
            sub: user.id,
            role: user.role,
            hotelId: user.hotelId
        });
        return NextResponse.json({
            tokenType: "Bearer",
            accessToken,
            expiresIn: 3600
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
