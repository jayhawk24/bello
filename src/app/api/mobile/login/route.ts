import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils";
import { userLoginSchema } from "@/lib/validations";
import { signAccessToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = userLoginSchema.safeParse({
            email: body.email,
            password: body.password
        });
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        const accessToken = await signAccessToken({
            sub: user.id,
            role: user.role,
            hotelId: user.hotelId
        });
        const refreshToken = generateRefreshToken();

        // Store refresh token (30 days)
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
            data: { userId: user.id, token: refreshToken, expiresAt }
        });

        // Optional device token registration in login payload
        if (body.deviceToken && typeof body.deviceToken === "string") {
            const platform =
                typeof body.platform === "string" ? body.platform : "android";
            await prisma.deviceToken.upsert({
                where: { token: body.deviceToken },
                update: { userId: user.id, platform },
                create: { token: body.deviceToken, userId: user.id, platform }
            });
        }

        return NextResponse.json({
            tokenType: "Bearer",
            accessToken,
            expiresIn: 3600,
            refreshToken,
            user: { id: user.id, role: user.role, hotelId: user.hotelId }
        });
    } catch (error) {
        console.error("Mobile login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
