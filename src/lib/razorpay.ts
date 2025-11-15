import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Get subscription plans from database
import { prisma } from "./prisma";

export async function getSubscriptionPlans(
    interval: "monthly" | "yearly" = "monthly"
) {
    const plans = await prisma.rzpSubscriptionPlan.findMany({
        where: {
            isActive: true
        },
        orderBy: {
            [interval === "monthly" ? "priceMonthly" : "priceYearly"]: "asc"
        }
    });

    return plans;
}

// Legacy subscription plans - to be removed after migration
export const SUBSCRIPTION_PLANS = {
    starter: {
        name: "Starter",
        description: "1-20 Rooms",
        price: 4900, // ₹49.00 in paise
        currency: "USD",
        period: "monthly",
        interval: 1,
        roomLimit: 20,
        features: [
            "Up to 20 rooms",
            "QR code access",
            "Basic service requests",
            "Email support",
            "Basic analytics"
        ]
    },
    growth: {
        name: "Growth",
        description: "21-50 Rooms",
        price: 12900, // ₹129.00 in paise
        currency: "USD",
        period: "monthly",
        interval: 1,
        roomLimit: 50,
        features: [
            "Up to 50 rooms",
            "QR code access",
            "Full service requests",
            "Priority support",
            "Advanced analytics",
            "Custom branding"
        ]
    },
    professional: {
        name: "Professional",
        description: "51-100 Rooms",
        price: 24900, // ₹249.00 in paise
        currency: "USD",
        period: "monthly",
        interval: 1,
        roomLimit: 100,
        features: [
            "Up to 100 rooms",
            "QR code access",
            "Premium service suite",
            "Phone & chat support",
            "Full analytics dashboard",
            "Multi-location support",
            "API access"
        ]
    },
    enterprise: {
        name: "Enterprise",
        description: "100+ Rooms",
        price: 44900, // ₹449.00 in paise
        currency: "USD",
        period: "monthly",
        interval: 1,
        roomLimit: -1, // Unlimited
        features: [
            "Unlimited rooms",
            "White-label solution",
            "Enterprise integrations",
            "24/7 dedicated support",
            "Custom analytics",
            "Multi-property management",
            "SLA guarantee"
        ]
    }
};

export async function createPaymentOrder(
    amount: number,
    currency: string = "USD",
    receipt?: string
) {
    try {
        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt: receipt || `order_${Date.now()}`,
            payment_capture: true
        });

        return order;
    } catch (error) {
        console.error("Error creating payment order:", error);
        throw error;
    }
}

// Helper function to verify payment signature
export function verifyPaymentSignature(
    paymentId: string,
    orderId: string,
    signature: string
): boolean {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(orderId + "|" + paymentId);
    const generated_signature = hmac.digest("hex");

    return generated_signature === signature;
}

// Helper function to verify subscription signature
export function verifySubscriptionSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string
): boolean {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(subscriptionId + "|" + paymentId);
    const generated_signature = hmac.digest("hex");

    return generated_signature === signature;
}

// Create a Razorpay plan
export async function createRazorpayPlan(params: {
    name: string;
    description: string;
    amount: number;
    currency: string;
    interval: "monthly" | "yearly";
}) {
    try {
        const plan = await razorpay.plans.create({
            period: params.interval === "monthly" ? "monthly" : "yearly",
            interval: 1,
            item: {
                name: params.name,
                description: params.description,
                amount: params.amount,
                currency: params.currency
            }
        });
        return plan;
    } catch (error) {
        console.error("Error creating Razorpay plan:", error);
        throw error;
    }
}

// Razorpay subscription response type
interface RazorpaySubscription {
    id: string;
    entity: string;
    plan_id: string;
    customer_id: string;
    status: string;
    current_start: number;
    current_end: number;
    ended_at: number | null;
    quantity: number;
    notes: Record<string, string>;
    charge_at: number;
    start_at: number;
    end_at: number;
    total_count: number;
    paid_count: number;
    customer_notify: boolean;
    created_at: number;
    expire_by: number | null;
    short_url: string;
    has_scheduled_changes: boolean;
    change_scheduled_at: number | null;
    source: string;
    payment_method: string;
    offer_id: string | null;
    remaining_count: number;
}

// Create a Razorpay subscription
export async function createRazorpaySubscription(params: {
    plan_id: string;
    customer_id: string;
    total_count: number;
    quantity?: number;
    start_at?: number;
    addons?: Array<{
        item: { name: string; amount: number; currency: string };
    }>;
    notes?: Record<string, string>;
}): Promise<RazorpaySubscription> {
    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: params.plan_id,
            customer_id: params.customer_id,
            customer_notify: 1,
            quantity: params.quantity || 1,
            total_count: params.total_count,
            start_at: params.start_at,
            addons: params.addons || [],
            notes: params.notes || {}
        } as any);
        return subscription as unknown as RazorpaySubscription;
    } catch (error) {
        console.error("Error creating Razorpay subscription:", error);
        throw error;
    }
}

// Create a Razorpay customer
export async function createRazorpayCustomer(params: {
    name: string;
    email: string;
    contact?: string;
    notes?: Record<string, string>;
}) {
    try {
        const customer = await razorpay.customers.create({
            name: params.name,
            email: params.email,
            contact: params.contact,
            notes: params.notes || {}
        });
        return customer;
    } catch (error) {
        console.warn("Razorpay likely customer already exists:", error);
        return null;
    }
}
