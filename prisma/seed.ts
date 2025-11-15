import { BillingCycle } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RAKPAChI3h6hmt",
    key_secret: process.env.RAZORPAY_SECRET || "duJKHxuRKqS6FhOmGd07eVLY"
});

async function createRazorpayPlan(
    name: string,
    description: string,
    amount: number,
    period: BillingCycle
) {
    try {
        const plan = await razorpay.plans.create({
            period: period === BillingCycle.monthly ? "monthly" : "yearly",
            interval: 1,
            item: {
                name,
                amount: amount * 100, // Convert to paise
                currency: "USD",
                description
            }
        });
        return plan.id;
    } catch (error) {
        console.error(`Failed to create Razorpay plan for ${name}:`, error);
        return null;
    }
}

async function main() {
    const plans = [
        {
            name: "Free",
            description: "1-2 Rooms",
            price: 0,
            period: BillingCycle.monthly,
            currency: "USD",
            roomLimit: 2,
            features: [
                "Up to 2 rooms",
                "Up to 2 staff users",
                "QR code access",
                "Basic service requests",
                "Notifications"
            ],
            isActive: true
        },
        {
            name: "Starter",
            description: "1-20 Rooms",
            price: 4900, // $49.00
            period: BillingCycle.monthly,
            currency: "USD",
            roomLimit: 20,
            features: [
                "Up to 20 rooms",
                "QR code access",
                "Basic service requests",
                "Email support",
                "Basic analytics"
            ],
            isActive: true
        },
        {
            name: "Starter",
            description: "1-20 Rooms",
            price: 47040, // $470.40 (20% discount)
            period: BillingCycle.yearly,
            currency: "USD",
            roomLimit: 20,
            features: [
                "Up to 20 rooms",
                "QR code access",
                "Basic service requests",
                "Email support",
                "Basic analytics"
            ],
            isActive: true
        },
        {
            name: "Growth",
            description: "21-50 Rooms",
            price: 9900,
            period: BillingCycle.monthly,
            currency: "USD",
            roomLimit: 50,
            features: [
                "Up to 50 rooms",
                "QR code access",
                "Full service requests",
                "Priority support",
                "Advanced analytics",
                "Custom branding"
            ],
            isActive: true
        },
        {
            name: "Growth",
            description: "21-50 Rooms",
            price: 18800, // $188.00
            period: BillingCycle.yearly,
            currency: "USD",
            roomLimit: 50,
            features: [
                "Up to 50 rooms",
                "QR code access",
                "Full service requests",
                "Priority support",
                "Advanced analytics",
                "Custom branding"
            ],
            isActive: true
        },

        {
            name: "Professional",
            description: "51-100 Rooms",
            price: 24900, // $249.00
            period: BillingCycle.monthly,
            currency: "USD",
            roomLimit: 100,
            features: [
                "Up to 100 rooms",
                "QR code access",
                "Premium service suite",
                "Phone & chat support",
                "Full analytics dashboard",
                "Multi-location support",
                "API access"
            ],
            isActive: true
        },
        {
            name: "Professional",
            description: "51-100 Rooms",
            price: 298800,
            period: BillingCycle.yearly,
            currency: "USD",
            roomLimit: 100,
            features: [
                "Up to 100 rooms",
                "QR code access",
                "Premium service suite",
                "Phone & chat support",
                "Full analytics dashboard",
                "Multi-location support",
                "API access"
            ],
            isActive: true
        }
    ];

    for (const plan of plans) {
        // Skip Razorpay plan creation for free tier
        let razorpayPlanId = null;
        if (plan.price > 0) {
            razorpayPlanId = await createRazorpayPlan(
                `${plan.name} ${
                    plan.period === BillingCycle.monthly ? "Monthly" : "Yearly"
                }`,
                plan.description,
                plan.price,
                plan.period
            );
        }

        // Generate a unique name for each plan variant
        const uniqueName = `${plan.name} ${
            plan.period === BillingCycle.monthly ? "Monthly" : "Yearly"
        }`;

        await prisma.rzpSubscriptionPlan.upsert({
            where: { name: uniqueName },
            update: {
                description: plan.description,
                price: plan.price,
                period: plan.period,
                currency: plan.currency,
                roomLimit: plan.roomLimit,
                features: plan.features,
                isActive: plan.isActive,
                razorpayPlanId: razorpayPlanId
            },
            create: {
                name: uniqueName,
                description: plan.description,
                price: plan.price,
                period: plan.period,
                currency: plan.currency,
                roomLimit: plan.roomLimit,
                features: plan.features,
                isActive: plan.isActive,
                razorpayPlanId: razorpayPlanId
            }
        });
    }

    console.log(
        "Initial subscription plans created successfully with Razorpay integration!"
    );
}

main()
    .catch((e) => {
        console.error("Error creating subscription plans:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
