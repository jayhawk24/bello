import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            body;

        // Verify payment signature
        const isSignatureValid = verifyPaymentSignature(
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        );

        if (!isSignatureValid) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        // Find payment order
        const paymentOrder = await prisma.paymentOrder.findUnique({
            where: { razorpayOrderId: razorpay_order_id },
            include: { subscription: true, hotel: true }
        });

        if (!paymentOrder) {
            return NextResponse.json(
                { error: "Payment order not found" },
                { status: 404 }
            );
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                paymentOrderId: paymentOrder.id,
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpaySignature: razorpay_signature,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                status: "captured",
                captured: true
            }
        });

        // Update payment order status
        await prisma.paymentOrder.update({
            where: { id: paymentOrder.id },
            data: { status: "captured" }
        });

        // Activate subscription if payment is successful
        if (paymentOrder.subscription) {
            await prisma.subscription.update({
                where: { id: paymentOrder.subscription.id },
                data: { status: "active" }
            });

            // Update hotel subscription status
            await prisma.hotel.update({
                where: { id: paymentOrder.hotelId },
                data: {
                    subscriptionStatus: "active",
                    subscriptionPlan: paymentOrder.subscription.planType
                }
            });
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            status: "Payment successful and subscription activated"
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
