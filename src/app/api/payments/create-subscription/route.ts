import { NextRequest, NextResponse } from "next/server";
import {
    createRazorpayPlan,
    createRazorpayCustomer,
    createRazorpaySubscription
} from "@/lib/razorpay";
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
        const plan = await prisma.rzpSubscriptionPlan.findUnique({
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
        const amount = plan.price;

        // Get Razorpay plan ID from our database
        if (!plan.razorpayPlanId) {
            return NextResponse.json(
                {
                    error: "Razorpay plan not found. Please ensure plan is set up in Razorpay."
                },
                { status: 400 }
            );
        }

        // Create customer in Razorpay if not exists
        const razorpayCustomer = await createRazorpayCustomer({
            name: user.name,
            email: user.email,
            contact: user.phone || undefined,
            notes: {
                id: user.id
            }
        });

        // Update user with Razorpay customer ID in database
        if (razorpayCustomer) {
            await prisma.user.update({
                where: { id: user.id },
                data: { razorpayCustomerId: razorpayCustomer.id }
            });
        }
        const rzp_customer_id =
            razorpayCustomer?.id || user.razorpayCustomerId || "";

        if (!rzp_customer_id) {
            return NextResponse.json(
                {
                    error: "Unable to create or retrieve Razorpay customer. Please try again."
                },
                { status: 400 }
            );
        }

        // Create subscription in Razorpay using existing plan ID
        const razorpaySubscription = await createRazorpaySubscription({
            plan_id: plan.razorpayPlanId!,
            customer_id: rzp_customer_id,
            total_count: billingCycle === "monthly" ? 12 : 1,
            quantity: 1,
            notes: {
                hotel_id: hotel.id,
                plan_name: plan.name,
                billing_cycle: billingCycle
            }
        });

        // Calculate subscription period
        const now = new Date();
        const currentPeriodStart = new Date(now);
        const currentPeriodEnd = new Date(now);

        if (billingCycle === "monthly") {
            currentPeriodEnd.setMonth(currentPeriodStart.getMonth() + 1);
        } else {
            currentPeriodEnd.setFullYear(currentPeriodStart.getFullYear() + 1);
        }

        // Map plan name to subscription tier
        const getTierFromPlanName = (
            name: string
        ): "free" | "basic" | "premium" | "enterprise" => {
            if (name.toLowerCase().includes("free")) return "free";
            if (name.toLowerCase().includes("starter")) return "basic";
            if (name.toLowerCase().includes("growth")) return "premium";
            return "enterprise";
        };

        await prisma.subscription.create({
            data: {
                hotelId: hotel.id,
                planType: getTierFromPlanName(plan.name),
                planId: plan.id,
                billingCycle,
                roomTier:
                    plan.roomLimit <= 20
                        ? "tier_1_20"
                        : plan.roomLimit <= 50
                        ? "tier_21_50"
                        : plan.roomLimit <= 100
                        ? "tier_51_100"
                        : "tier_100_plus",
                amount,
                currency: plan.currency,
                status: "inactive", // Will be activated on successful payment
                currentPeriodStart,
                currentPeriodEnd,
                razorpaySubscriptionId: razorpaySubscription.id,
                razorpayCustomerId: rzp_customer_id
            }
        });

        return NextResponse.json({
            subscriptionId: razorpaySubscription.id,
            planId: plan.razorpayPlanId,
            customerId: rzp_customer_id,
            amount,
            currency: plan.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            name: "StayScan Hotel Concierge",
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
