import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate verification token
        const verificationToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Store the verification token
        await prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt
            }
        });

        // In a real application, you would send an email here
        // For development, we'll just log the verification link
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
        console.log('Email verification link:', verificationUrl);

        // TODO: Send email with verification link
        // await sendEmailVerification(user.email, verificationUrl);

        return NextResponse.json({
            success: true,
            message: 'Verification email has been sent.'
        });

    } catch (error) {
        console.error('Send verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
