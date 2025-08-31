import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations";
import { generateAccessCode } from "@/lib/utils";

export async function GET() {
    try {
        const session = await auth();
        if (
            !session ||
            !["hotel_admin", "hotel_staff"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // For hotel staff, use their hotelId directly. For admins, find their hotel
        let hotelId = session.user.hotelId;

        if (session.user.role === "hotel_admin" && !hotelId) {
            const hotel = await prisma.hotel.findFirst({
                where: { adminId: session.user.id }
            });

            if (!hotel) {
                return NextResponse.json(
                    { error: "Hotel not found" },
                    { status: 404 }
                );
            }
            hotelId = hotel.id;
        }

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        const rooms = await prisma.room.findMany({
            where: { hotelId },
            orderBy: { roomNumber: "asc" }
        });

        return NextResponse.json({
            success: true,
            rooms: rooms
        });
    } catch (error) {
        console.error("Rooms fetch error:", error);
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
        const validatedFields = roomSchema.safeParse(body);
        if (!validatedFields.success) {
            return NextResponse.json(
                {
                    error: "Invalid input data",
                    details: validatedFields.error.issues
                },
                { status: 400 }
            );
        }

        const { roomNumber, roomType } = validatedFields.data;

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: session.user.id }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Enforce free plan limit: only 1 room allowed
        if (!hotel.subscriptionPlan || hotel.subscriptionPlan === "free") {
            const roomCount = await prisma.room.count({
                where: { hotelId: hotel.id }
            });
            if (roomCount >= 1) {
                return NextResponse.json(
                    {
                        error: "Free plan allows only 1 room. Upgrade to add more.",
                        redirect: "/pricing"
                    },
                    { status: 403 }
                );
            }
        }

        // Check if room number already exists
        const existingRoom = await prisma.room.findFirst({
            where: {
                hotelId: hotel.id,
                roomNumber
            }
        });

        if (existingRoom) {
            return NextResponse.json(
                { error: "Room number already exists" },
                { status: 409 }
            );
        }

        // Generate access code
        const accessCode = generateAccessCode();

        // Create room
        const room = await prisma.room.create({
            data: {
                roomNumber,
                roomType,
                accessCode,
                hotelId: hotel.id,
                isOccupied: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "Room added successfully",
            room
        });
    } catch (error) {
        console.error("Room creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
