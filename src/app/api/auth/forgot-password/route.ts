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
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                success: true,
                message: 'If an account with that email exists, you will receive password reset instructions.'
            });
        }

        // Generate reset token
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Store the reset token (in a real app, you'd store this in the database)
        // For now, we'll use a simple approach
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: resetTokenExpiry
            }
        });

        // In a real application, you would send an email here
        // For development, we'll just log the reset link
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        console.log('Password reset link:', resetUrl);

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(user.email, resetUrl);

        return NextResponse.json({
            success: true,
            message: 'Password reset instructions have been sent to your email.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
