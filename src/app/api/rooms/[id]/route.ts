import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

interface RoomUpdateData {
    roomNumber: string;
    roomType: string;
}

async function getAuthContext(request: NextRequest) {
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
    const session = await auth();
    if (session?.user) {
        return {
            userId: session.user.id,
            role: session.user.role,
            hotelId: session.user.hotelId ?? null
        } as const;
    }
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        const room = await prisma.room.findFirst({
            where: {
                id: id,
                hotelId: hotelId
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            room
        });
    } catch (error) {
        console.error("Room fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        const headerRole =
            (request as any).headers?.get?.("x-user-role") || null;
        const role = headerRole || session?.user?.role;
        const userId = session?.user?.id;
        if (!role || role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { roomNumber, roomType } = body as RoomUpdateData;

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: userId as string }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Verify room exists and belongs to the hotel
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: id,
                hotelId: hotel.id
            }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Check if new room number conflicts with another room
        if (roomNumber && roomNumber !== existingRoom.roomNumber) {
            const roomNumberConflict = await prisma.room.findFirst({
                where: {
                    hotelId: hotel.id,
                    roomNumber: roomNumber,
                    id: { not: id }
                }
            });

            if (roomNumberConflict) {
                return NextResponse.json(
                    { error: "A room with this number already exists" },
                    { status: 409 }
                );
            }
        }

        // Prepare update data
        const updateData: Partial<RoomUpdateData> = {};

        if (roomNumber !== undefined) {
            updateData.roomNumber = roomNumber.trim();
        }

        if (roomType !== undefined) {
            updateData.roomType = roomType.trim();
        }

        // Update the room
        const updatedRoom = await prisma.room.update({
            where: { id: id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: "Room updated successfully",
            room: updatedRoom
        });
    } catch (error) {
        console.error("Room update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { role, userId } = await getAuthContext(request);
        if (!role || role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: userId as string }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Check if room exists and belongs to the hotel
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: id,
                hotelId: hotel.id
            }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Check if room is currently occupied
        if (existingRoom.isOccupied) {
            return NextResponse.json(
                { error: "Cannot delete occupied room" },
                { status: 400 }
            );
        }

        // Delete the room
        await prisma.room.delete({
            where: { id: id }
        });

        return NextResponse.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("Room deletion error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
