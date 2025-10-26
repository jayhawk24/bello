import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations";
import { generateAccessCode, getRoomLimitFromTier } from "@/lib/utils";

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

        // Get current active subscription to check room limits
        const subscription = await prisma.subscription.findFirst({
            where: {
                hotelId: hotel.id,
                status: "active"
            },
            orderBy: { createdAt: "desc" }
        });

        // Default to free plan limits if no active subscription
        let roomLimit = 1; // Free plan default

        if (subscription) {
            roomLimit = getRoomLimitFromTier(subscription.roomTier);
        } else if (
            !hotel.subscriptionTier ||
            hotel.subscriptionTier === "free"
        ) {
            roomLimit = 1; // Free plan allows only 1 room
        }

        // Check current room count against subscription limit
        const currentRoomCount = await prisma.room.count({
            where: { hotelId: hotel.id }
        });

        if (currentRoomCount >= roomLimit) {
            const planName = subscription?.planType || "free";
            const tierName =
                subscription?.roomTier?.replace(/_/g, " ") || "free tier";

            return NextResponse.json(
                {
                    error: `${
                        planName.charAt(0).toUpperCase() + planName.slice(1)
                    } plan (${tierName}) allows maximum ${
                        roomLimit === Infinity ? "unlimited" : roomLimit
                    } room${
                        roomLimit !== 1 ? "s" : ""
                    }. You currently have ${currentRoomCount} room${
                        currentRoomCount !== 1 ? "s" : ""
                    }. Upgrade to add more.`,
                    redirect: "/pricing",
                    currentCount: currentRoomCount,
                    limit: roomLimit === Infinity ? null : roomLimit,
                    planType: planName,
                    roomTier: subscription?.roomTier
                },
                { status: 403 }
            );
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
