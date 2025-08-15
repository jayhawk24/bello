import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find the verification token
        const verificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Invalid verification token' },
                { status: 400 }
            );
        }

        // Check if token has expired
        if (verificationToken.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Verification token has expired' },
                { status: 400 }
            );
        }

        // Check if token has already been used
        if (verificationToken.usedAt) {
            return NextResponse.json(
                { error: 'Email has already been verified' },
                { status: 400 }
            );
        }

        // Mark the verification token as used
        await prisma.emailVerificationToken.update({
            where: { id: verificationToken.id },
            data: { usedAt: new Date() }
        });

        // Here you could also update the user's emailVerified field if you had one
        // await prisma.user.update({
        //     where: { id: verificationToken.userId },
        //     data: { emailVerified: new Date() }
        // });

        return NextResponse.json({
            success: true,
            message: 'Email has been verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
