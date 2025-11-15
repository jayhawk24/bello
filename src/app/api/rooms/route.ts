import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations";
import { generateAccessCode } from "@/lib/utils";

async function getAuthContext(request: NextRequest) {
    // Prefer middleware-injected headers
    const headerUserId = request.headers.get("x-user-id");
    const headerRole = request.headers.get("x-user-role");
    const headerHotelId = request.headers.get("x-hotel-id");
    if (headerUserId && headerRole) {
        return {
            userId: headerUserId,
            role: headerRole,
            hotelId: headerHotelId
        } as const;
    }
    // Fallback to NextAuth session
    const session = await auth();
    if (session?.user) {
        return {
            userId: session.user.id,
            role: session.user.role,
            hotelId: session.user.hotelId ?? null
        } as const;
    }
    // Fallback to manual Bearer verification
    const authHeader =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
            const payload = await verifyAccessToken<{
                role: string;
                hotelId?: string | null;
            }>(token);
            return {
                userId: payload.sub,
                role: payload.role,
                hotelId: payload.hotelId ?? null
            } as const;
        } catch {}
    }
    return { userId: null, role: null, hotelId: null } as const;
}

export async function GET(request: NextRequest) {
    try {
        const {
            role,
            userId,
            hotelId: headerHotelId
        } = await getAuthContext(request);
        if (!role || !["hotel_admin", "hotel_staff"].includes(role)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // For hotel staff, use their hotelId directly. For admins, find their hotel
        let hotelId = headerHotelId as string | null;
        if (role === "hotel_admin" && !hotelId) {
            const hotel = await prisma.hotel.findFirst({
                where: { adminId: userId as string }
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
        const { role, userId } = await getAuthContext(request);
        if (!role || role !== "hotel_admin") {
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
            where: { adminId: userId as string }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Enforce room limits based on active subscription room tier (fallback to free plan)
        const activeSubscription = await prisma.subscription.findFirst({
            where: { hotelId: hotel.id, status: "active" },
            orderBy: { createdAt: "desc" }
        });

        const getRoomLimitFromTier = (
            roomTier: string | null | undefined
        ): number | null => {
            switch (roomTier) {
                case "tier_1_20":
                    return 20;
                case "tier_21_50":
                    return 50;
                case "tier_51_100":
                    return 100;
                case "tier_100_plus":
                    return null; // unlimited
                default:
                    return 1; // default for free/unknown
            }
        };

        // Determine room limit
        let roomLimit: number | null = null;
        if (activeSubscription) {
            roomLimit = getRoomLimitFromTier(activeSubscription.roomTier);
        } else if (hotel.subscriptionPlan === "free") {
            roomLimit = 1;
        }

        if (roomLimit !== null) {
            const currentCount = await prisma.room.count({
                where: { hotelId: hotel.id }
            });
            if (currentCount >= roomLimit) {
                const tierLabel = activeSubscription?.roomTier
                    ? activeSubscription.roomTier.replace(/_/g, " ")
                    : "free";
                return NextResponse.json(
                    {
                        error: "room_limit_reached",
                        message: `Your plan (${tierLabel}) allows a maximum of ${roomLimit} room${
                            roomLimit === 1 ? "" : "s"
                        }. Upgrade your plan to add more rooms.`
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

        // Create room and increment hotel's totalRooms atomically
        const room = await prisma.$transaction(async (tx) => {
            const created = await tx.room.create({
                data: {
                    roomNumber,
                    roomType,
                    accessCode,
                    hotelId: hotel.id,
                    isOccupied: false
                }
            });
            await tx.hotel.update({
                where: { id: hotel.id },
                data: { totalRooms: { increment: 1 } }
            });
            return created;
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
