import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { SubscriptionTier } from "@prisma/client";

// Webhook secret key from Razorpay dashboard
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

interface RazorpaySubscriptionCharged {
    entity: string;
    account_id: string;
    event: "subscription.charged";
    payload: {
        subscription: {
            entity: {
                id: string; // Razorpay subscription ID
                entity: "subscription";
                plan_id: string;
                customer_id: string;
                status:
                    | "active"
                    | "authenticated"
                    | "cancelled"
                    | "completed"
                    | "expired";
                current_start: number;
                current_end: number;
                charge_at: number;
                end_at: number;
                notes: any[];
            };
        };
        payment: {
            entity: {
                id: string;
                amount: number;
                currency: string;
                status: string;
                method: string;
            };
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body and signature
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");
        console.log(rawBody, signature);

        // Verify webhook signature
        if (!webhookSecret || !signature) {
            return NextResponse.json(
                { error: "Missing webhook secret or signature" },
                { status: 401 }
            );
        }

        const isValid = validateWebhookSignature(
            rawBody,
            signature,
            webhookSecret
        );
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid webhook signature" },
                { status: 401 }
            );
        }

        // Parse the webhook payload
        const payload = JSON.parse(rawBody) as RazorpaySubscriptionCharged;

        // Only handle subscription.charged events
        if (payload.event !== "subscription.charged") {
            return NextResponse.json(
                { message: "Event type not handled" },
                { status: 200 }
            );
        }

        const {
            id: razorpaySubscriptionId,
            status,
            current_start,
            current_end,
            plan_id: razorpayPlanId,
            notes
        } = payload.payload.subscription.entity;

        // Get payment details
        const payment = payload.payload.payment.entity;

        console.log(
            `Received subscription.charged event for Razorpay subscription ID: ${razorpaySubscriptionId} , plan ID: ${razorpayPlanId}`
        );

        // Find the local subscription plan by razorpayPlanId
        const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
            where: { razorpayPlanId }
        });

        if (!subscriptionPlan) {
            console.error(
                `No subscription plan found for Razorpay plan ID: ${razorpayPlanId}`
            );
            return NextResponse.json(
                { error: "Subscription plan not found" },
                { status: 404 }
            );
        }

        // Find and update the subscription in our database
        const subscription = await prisma.subscription.findFirst({
            where: { razorpaySubscriptionId },
            include: { hotel: true }
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 }
            );
        }

        // Update subscription status and period
        await prisma.$transaction([
            // Update subscription
            prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: status === "active" ? "active" : "past_due",
                    currentPeriodStart: new Date(current_start * 1000),
                    currentPeriodEnd: new Date(current_end * 1000),
                    planId: subscriptionPlan.id,
                    planType: subscriptionPlan.name
                        .toLowerCase()
                        .includes("free")
                        ? "free"
                        : subscriptionPlan.name
                              .toLowerCase()
                              .includes("starter")
                        ? "basic"
                        : subscriptionPlan.name.toLowerCase().includes("growth")
                        ? "premium"
                        : "enterprise",
                    billingCycle: subscriptionPlan.period,
                    roomTier:
                        subscriptionPlan.roomLimit <= 20
                            ? "tier_1_20"
                            : subscriptionPlan.roomLimit <= 50
                            ? "tier_21_50"
                            : subscriptionPlan.roomLimit <= 100
                            ? "tier_51_100"
                            : "tier_100_plus",
                    amount: payment.amount,
                    currency: payment.currency
                }
            }),
            // Create payment order
            prisma.paymentOrder.create({
                data: {
                    hotelId: subscription.hotelId,
                    subscriptionId: subscription.id,
                    razorpayOrderId: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: "captured"
                }
            }),
            // Update hotel subscription status
            prisma.hotel.update({
                where: { id: subscription.hotelId },
                data: {
                    subscriptionStatus:
                        status === "active" ? "active" : "past_due",
                    subscriptionTier: subscription.planType
                }
            })
        ]);

        return NextResponse.json(
            { message: "Subscription status updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
