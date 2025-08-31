import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { staffCreationSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/utils";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: session.user.id }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

  // Get all staff members for the hotel
  const staff = await prisma.user.findMany({
    where: {
      hotelId: hotel.id,
      role: "hotel_staff",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      lastLogin: true,
    },
    orderBy: {
      name: "asc",
    },
  });        return NextResponse.json({
            success: true,
            staff
        });
    } catch (error) {
        console.error("Staff fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input data
        const validatedFields = staffCreationSchema.safeParse(body);
        if (!validatedFields.success) {
            return NextResponse.json(
                {
                    error: "Invalid input data",
                    details: validatedFields.error.issues
                },
                { status: 400 }
            );
        }

        const { name, email, phone, password } = validatedFields.data;
        const role = body.role || "hotel_staff";

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: session.user.id }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Enforce free plan limit: only 1 staff allowed
        if (hotel.subscriptionPlan === 'free') {
            const staffCount = await prisma.user.count({
                where: {
                    hotelId: hotel.id,
                    role: 'hotel_staff',
                },
            });
            if (staffCount >= 1) {
                return NextResponse.json(
                    { error: "Free plan allows only 1 staff user. Upgrade to add more.", redirect: "/pricing" },
                    { status: 403 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create staff member
        const staffMember = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: role as "hotel_admin" | "hotel_staff",
                hotelId: hotel.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: "Staff member added successfully",
            staff: staffMember
        });
    } catch (error) {
        console.error("Staff creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
