import { PrismaClient } from "@prisma/client";
import { SUBSCRIPTION_PLANS } from "../src/lib/razorpay";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting plan migration...");

    for (const [key, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
        console.log(`Migrating plan: ${plan.name}`);

        await prisma.subscriptionPlan.upsert({
            where: {
                name: plan.name
            },
            update: {
                description: plan.description,
                price: plan.price,
                period: 'monthly', // Default to monthly
                currency: plan.currency,
                roomLimit: plan.roomLimit,
                features: plan.features
            },
            create: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                period: 'monthly', // Default to monthly
                currency: plan.currency,
                roomLimit: plan.roomLimit,
                features: plan.features
            }
        });
    }

    console.log("Plan migration completed");
}

main()
    .catch((e) => {
        console.error("Error during migration:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
