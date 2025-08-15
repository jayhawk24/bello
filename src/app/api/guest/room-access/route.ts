import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hotelId = searchParams.get('hotelId');
        const roomNumber = searchParams.get('roomNumber');
        const accessCode = searchParams.get('accessCode');

        if (!hotelId || !roomNumber || !accessCode) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Find the room with matching details
        const room = await prisma.room.findFirst({
            where: {
                hotelId,
                roomNumber,
                accessCode
            },
            include: {
                hotel: {
                    select: {
                        name: true,
                        contactEmail: true,
                        contactPhone: true
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: "Invalid access credentials" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                hotel: room.hotel
            }
        });
    } catch (error) {
        console.error("Guest room access error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
