import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { BillingCycle } from "@prisma/client";
import { Prisma } from "@prisma/client";

const planSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1),
    price: z.number().int().positive(),
    period: z.enum(["monthly", "yearly"]),
    currency: z.string().length(3).default("INR"),
    roomLimit: z.number().int().positive(),
    features: z.array(z.string()),
    razorpayPlanId: z.string().optional()
});

async function isAuthorized(session: any) {
    if (session?.user?.role !== "SUPER_ADMIN") {
        return false;
    }
    return true;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const interval = searchParams.get("interval");

        if (interval && !["monthly", "yearly"].includes(interval)) {
            return NextResponse.json(
                {
                    error: "Invalid interval parameter. Use 'monthly' or 'yearly'"
                },
                { status: 400 }
            );
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true,
                ...(interval && { period: interval as BillingCycle })
            },
            orderBy: {
                price: "asc"
            }
        });

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!(await isAuthorized(session))) {
            return NextResponse.json(
                { error: "Forbidden - Super Admin access required" },
                { status: 403 }
            );
        }

        const data = await request.json();

        const validationResult = planSchema.safeParse(data);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.flatten()
                },
                { status: 400 }
            );
        }

        const plan = await prisma.subscriptionPlan.create({
            data: validationResult.data
        });

        return NextResponse.json({ plan }, { status: 201 });
    } catch (error) {
        console.error("Error creating subscription plan:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "A plan with this name already exists" },
                    { status: 409 }
                );
            }
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!(await isAuthorized(session))) {
            return NextResponse.json(
                { error: "Forbidden - Super Admin access required" },
                { status: 403 }
            );
        }

        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json(
                { error: "Plan ID is required" },
                { status: 400 }
            );
        }

        const validationResult = planSchema.partial().safeParse(updateData);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.flatten()
                },
                { status: 400 }
            );
        }

        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: validationResult.data
        });

        return NextResponse.json({ plan });
    } catch (error) {
        console.error("Error updating subscription plan:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Plan not found" },
                    { status: 404 }
                );
            }
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!(await isAuthorized(session))) {
            return NextResponse.json(
                { error: "Forbidden - Super Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Plan ID is required" },
                { status: 400 }
            );
        }

        await prisma.subscriptionPlan.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json(
            { message: "Plan successfully deactivated" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deactivating subscription plan:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Plan not found" },
                    { status: 404 }
                );
            }
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
