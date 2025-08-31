import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { planId, billingCycle } = await request.json();

        // Validate required fields
        if (!planId || !billingCycle) {
            return NextResponse.json(
                {
                    error: "Missing required fields: planId, billingCycle"
                },
                { status: 400 }
            );
        }

        // Get the subscription plan
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json(
                { error: "Subscription plan not found" },
                { status: 404 }
            );
        }

        // Get user's hotel
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { managedHotel: true }
        });

        if (!user?.managedHotel) {
            return NextResponse.json(
                { error: "Hotel not found for user" },
                { status: 404 }
            );
        }

        const hotel = user.managedHotel;

        // Get amount based on billing cycle
        const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

        if (!amount) {
            return NextResponse.json(
                { error: "Invalid plan type or billing cycle" },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const orderResponse = await createPaymentOrder(
            amount,
            "INR",
            `subscription_${hotel.id}_${Date.now()}`
        );

        // Create payment order in database
        const paymentOrder = await prisma.paymentOrder.create({
            data: {
                hotelId: hotel.id,
                razorpayOrderId: orderResponse.id,
                amount,
                currency: plan.currency,
                status: "created",
                receipt: orderResponse.receipt,
                notes: {
                    planId,
                    billingCycle,
                    planName: plan.name,
                    roomLimit: plan.roomLimit
                }
            }
        });

        // Create or update subscription record (initially inactive)
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();

        if (billingCycle === "monthly") {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        } else {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        }

        // Check if subscription already exists for this hotel
        const existingSubscription = await prisma.subscription.findFirst({
            where: { hotelId: hotel.id }
        });

        // Map plan name to subscription tier
        const getTierFromPlanName = (name: string): 'free' | 'basic' | 'premium' | 'enterprise' => {
            if (name.toLowerCase().includes('free')) return 'free';
            if (name.toLowerCase().includes('starter')) return 'basic';
            if (name.toLowerCase().includes('growth')) return 'premium';
            return 'enterprise';
        };

        let subscription;
        if (existingSubscription) {
            subscription = await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    planType: getTierFromPlanName(plan.name),
                    billingCycle,
                    roomTier: plan.roomLimit <= 20 ? 'tier_1_20' :
                             plan.roomLimit <= 50 ? 'tier_21_50' :
                             plan.roomLimit <= 100 ? 'tier_51_100' : 'tier_100_plus',
                    amount,
                    currency: plan.currency,
                    currentPeriodStart,
                    currentPeriodEnd
                }
            });
        } else {
            subscription = await prisma.subscription.create({
                data: {
                    hotelId: hotel.id,
                    planType: getTierFromPlanName(plan.name),
                    billingCycle,
                    roomTier: plan.roomLimit <= 20 ? 'tier_1_20' :
                             plan.roomLimit <= 50 ? 'tier_21_50' :
                             plan.roomLimit <= 100 ? 'tier_51_100' : 'tier_100_plus',
                    amount,
                    currency: plan.currency,
                    status: "inactive", // Will be activated on successful payment
                    currentPeriodStart,
                    currentPeriodEnd
                }
            });
        }

        // Link payment order to subscription
        await prisma.paymentOrder.update({
            where: { id: paymentOrder.id },
            data: { subscriptionId: subscription.id }
        });

        return NextResponse.json({
            orderId: orderResponse.id,
            amount: orderResponse.amount,
            currency: orderResponse.currency,
            key: process.env.RAZORPAY_KEY_ID,
            name: "Bello Hotel Concierge",
            description: `${plan.name} Plan - ${
                billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)
            }`,
            prefill: {
                name: user.name,
                email: user.email,
                contact: hotel.contactPhone
            },
            theme: {
                color: "#D4AF37"
            }
        });
    } catch (error) {
        console.error("Create subscription payment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
