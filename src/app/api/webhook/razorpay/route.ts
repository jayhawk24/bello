import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

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

        // Verify webhook signature
        if (!webhookSecret || !signature) {
            return NextResponse.json(
                { error: "Missing webhook secret or signature" },
                { status: 401 }
            );
        }

        const isValid = validateWebhookSignature(
            JSON.stringify(rawBody),
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
            current_end
        } = payload.payload.subscription.entity;

        // Get payment details
        const payment = payload.payload.payment.entity;

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
                    currentPeriodEnd: new Date(current_end * 1000)
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
                        status === "active" ? "active" : "past_due"
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
