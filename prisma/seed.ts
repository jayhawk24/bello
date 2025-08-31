import { prisma } from "../src/lib/prisma";

async function main() {
    const plans = [
        {
            name: "Free",
            description: "1-2 Rooms",
            priceMonthly: 0,
            priceYearly: 0,
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
            priceMonthly: 4900, // $49.00
            priceYearly: 47040, // $470.40 (20% discount)
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
            priceMonthly: 12900, // $129.00
            priceYearly: 123840, // $1,238.40 (20% discount)
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
            priceMonthly: 24900, // $249.00
            priceYearly: 238800, // $2,388.00 (20% discount)
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

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan
        });
    }

    console.log("Initial subscription plans created successfully!");
}

main()
    .catch((e) => {
        console.error("Error creating subscription plans:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
