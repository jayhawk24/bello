import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's hotel and subscription
        const subscription = await prisma.subscription.findFirst({
            where: { hotelId: session.user.hotelId || "", status: "active" },
            orderBy: { createdAt: "desc" }
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "Subscription not found for user" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: subscription.id,
            planType: subscription.planType,
            planId: subscription.planId,
            billingCycle: subscription.billingCycle,
            roomTier: subscription.roomTier,
            status: subscription.status,
            amount: subscription.amount,
            currency: subscription.currency,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            createdAt: subscription.createdAt
        });
    } catch (error) {
        console.error("Get subscription error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
