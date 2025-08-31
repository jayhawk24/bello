import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const interval = searchParams.get("interval") || "monthly";

        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                [interval === "monthly" ? "priceMonthly" : "priceYearly"]: "asc"
            }
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return NextResponse.json(
            { error: "Error fetching subscription plans" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                description: data.description,
                priceMonthly: data.priceMonthly,
                priceYearly: data.priceYearly,
                currency: data.currency || "INR",
                roomLimit: data.roomLimit,
                features: data.features
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error("Error creating subscription plan:", error);
        return NextResponse.json(
            { error: "Error creating subscription plan" },
            { status: 500 }
        );
    }
}
