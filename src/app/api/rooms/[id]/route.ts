import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RoomUpdateData {
    roomNumber: string;
    roomType: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session || !['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
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

        const room = await prisma.room.findFirst({
            where: {
                id: params.id,
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
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { roomNumber, roomType } = body as RoomUpdateData;

        if (!roomNumber || !roomType) {
            return NextResponse.json(
                { error: "Room number and type are required" },
                { status: 400 }
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

        // Check if room exists and belongs to the hotel
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: params.id,
                hotelId: hotel.id
            }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Check if room number is already taken (excluding current room)
        const roomNumberExists = await prisma.room.findFirst({
            where: {
                roomNumber,
                hotelId: hotel.id,
                id: { not: params.id }
            }
        });

        if (roomNumberExists) {
            return NextResponse.json(
                { error: "Room number already exists" },
                { status: 409 }
            );
        }

        // Update the room
        const updatedRoom = await prisma.room.update({
            where: { id: params.id },
            data: {
                roomNumber,
                roomType,
                updatedAt: new Date()
            }
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
    { params }: { params: { id: string } }
) {
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

        // Check if room exists and belongs to the hotel
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: params.id,
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
            where: { id: params.id }
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
