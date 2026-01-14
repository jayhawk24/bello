import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";
import { userRegistrationSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { createHotelAccount } from "@/lib/hotel-setup";

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

                // Create hotel account with default settings
                const hotel = await createHotelAccount(
                    tx,
                    user.id,
                    hotelName,
                    email,
                    phone
                );

                // Fetch updated user with hotel reference
                const updatedUser = await tx.user.findUniqueOrThrow({
                    where: { id: user.id }
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
