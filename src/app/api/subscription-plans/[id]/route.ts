import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: {
                id: params.id
            }
        });

        if (!plan) {
            return NextResponse.json(
                { error: "Subscription plan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error("Error fetching subscription plan:", error);
        return NextResponse.json(
            { error: "Error fetching subscription plan" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();

        const plan = await prisma.subscriptionPlan.update({
            where: {
                id: params.id
            },
            data: {
                name: data.name,
                description: data.description,
                priceMonthly: data.priceMonthly,
                priceYearly: data.priceYearly,
                currency: data.currency,
                roomLimit: data.roomLimit,
                features: data.features,
                isActive: data.isActive
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error("Error updating subscription plan:", error);
        return NextResponse.json(
            { error: "Error updating subscription plan" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.subscriptionPlan.delete({
            where: {
                id: params.id
            }
        });

        return NextResponse.json({
            message: "Subscription plan deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting subscription plan:", error);
        return NextResponse.json(
            { error: "Error deleting subscription plan" },
            { status: 500 }
        );
    }
}
