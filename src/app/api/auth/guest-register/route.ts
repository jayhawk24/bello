import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";
import { z } from "zod";

const guestRegistrationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    hotelId: z.string().optional()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input data
        const validatedFields = guestRegistrationSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json(
                {
                    error: "Invalid input data",
                    details: validatedFields.error.issues
                },
                { status: 400 }
            );
        }

        const { firstName, lastName, email, phone, password, hotelId } =
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

        // Verify hotel exists if hotelId is provided
        let validHotelId = hotelId;
        if (hotelId) {
            const hotel = await prisma.hotel.findUnique({
                where: { id: hotelId }
            });
            if (!hotel) {
                validHotelId = undefined; // Hotel doesn't exist, create guest without hotel association
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create guest user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
                phone: phone || null,
                role: "guest",
                hotelId: validHotelId || null
            }
        });

        // Return success (password excluded)
        return NextResponse.json({
            success: true,
            message: "Guest account created successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error("Guest registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
