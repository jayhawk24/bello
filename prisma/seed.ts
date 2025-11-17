import { BillingCycle } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET
});
const hasRazorpayCreds = Boolean(
    (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) &&
        (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET)
);

async function createRazorpayPlan(
    name: string,
    description: string,
    amountMinor: number,
    period: BillingCycle
) {
    // amountMinor expected in currency minor units already (e.g. 4900 = $49.00)
    if (!hasRazorpayCreds) {
        console.warn(
            "Skipping Razorpay plan creation – missing API credentials."
        );
        return null;
    }
    try {
        const plan = await razorpay.plans.create({
            period: period === BillingCycle.monthly ? "monthly" : "yearly",
            interval: 1,
            item: {
                name,
                amount: amountMinor, // already minor units
                currency: "INR",
                description
            }
        });
        console.log(`Created Razorpay plan '${name}' => ${plan.id}`);
        return plan.id;
    } catch (error) {
        console.error(`Failed to create Razorpay plan for ${name}:`, error);
        return null;
    }
}

async function main() {
    console.log("🔰 Starting database seed...");
    const plans = [
        {
            name: "Free",
            description: "1-2 Rooms",
            price: 0,
            period: BillingCycle.monthly,
            currency: "INR",
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
            price: 49_900, // ₹499.00
            period: BillingCycle.monthly,
            currency: "INR",
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
            price: 499_900, // ₹4,999.00
            period: BillingCycle.yearly,
            currency: "INR",
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
            price: 99_900, // ₹999.00
            period: BillingCycle.monthly,
            currency: "INR",
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
            price: 999_900, // ₹9,999.00
            period: BillingCycle.yearly,
            currency: "INR",
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
            price: 199_900, // ₹1,999.00
            period: BillingCycle.monthly,
            currency: "INR",
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
            price: 1_999_900, // ₹19,999.00
            period: BillingCycle.yearly,
            currency: "INR",
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

    console.log(
        "Creating initial subscription plans with Razorpay integration..."
    );

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
        console.log(
            `Upserted subscriptionPlan '${uniqueName}' (Razorpay: ${
                razorpayPlanId || "none"
            })`
        );
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
