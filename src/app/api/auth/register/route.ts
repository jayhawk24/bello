import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, calculateRoomTier } from "@/lib/utils";
import { userRegistrationSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input data
        const validatedFields = userRegistrationSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json(
                {
                    error: "Invalid input data",
                    details: validatedFields.error.issues
                },
                { status: 400 }
            );
        }

        const { hotelName, email, password, firstName, lastName, phone } =
            validatedFields.data;

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

        // Start transaction to create user and hotel
        const result = await prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
                // Create user first
                const user = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name: `${firstName} ${lastName}`,
                        phone,
                        role: "hotel_admin"
                    }
                });

                // Create hotel with the user as admin
                const hotel = await tx.hotel.create({
                    data: {
                        name: hotelName,
                        address: "", // Will be filled later in onboarding
                        city: "",
                        state: "",
                        country: "",
                        contactEmail: email,
                        contactPhone: phone,
                        adminId: user.id,
                        subscriptionPlan: "free",
                        subscriptionStatus: "inactive", // Will be activated after payment
                        totalRooms: 0 // Will be set during hotel setup
                    }
                });

                // Update user with hotel reference
                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: { hotelId: hotel.id }
                });

                // Create default services for the new hotel
                const defaultServices = [
                    {
                        name: "Room Service",
                        description:
                            "Order food and beverages directly to your room",
                        category: "room_service" as const,
                        icon: "🍽️"
                    },
                    {
                        name: "Housekeeping",
                        description:
                            "Request cleaning services, towels, and amenities",
                        category: "housekeeping" as const,
                        icon: "🧹"
                    },
                    {
                        name: "Concierge Services",
                        description: "Local recommendations and assistance",
                        category: "concierge" as const,
                        icon: "🎩"
                    },
                    {
                        name: "Maintenance",
                        description: "Report room issues and request repairs",
                        category: "maintenance" as const,
                        icon: "🔧"
                    },
                    {
                        name: "Laundry Service",
                        description:
                            "Professional cleaning and pressing services",
                        category: "laundry" as const,
                        icon: "👔"
                    }
                ];

                await tx.service.createMany({
                    data: defaultServices.map((service) => ({
                        ...service,
                        hotelId: hotel.id,
                        isActive: true
                    }))
                });

                return { user: updatedUser, hotel };
            }
        );

        // Return success (password excluded)
        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role
                },
                hotel: {
                    id: result.hotel.id,
                    name: result.hotel.name
                }
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
