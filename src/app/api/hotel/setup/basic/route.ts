import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            hotelId,
            receptionNumber,
            emergencyNumber,
            checkInTime,
            checkOutTime,
            hotelDescription,
            amenities
        } = body;

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel ID is required" },
                { status: 400 }
            );
        }

        // Verify the user has access to this hotel
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                managedHotel: true,
                hotel: true // Hotel they're assigned to
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this hotel (either manages it or is assigned to it)
        const hasAccess =
            user.managedHotel?.id === hotelId || user.hotel?.id === hotelId;

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied to this hotel" },
                { status: 403 }
            );
        }

        // Verify the hotel exists
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found in database" },
                { status: 404 }
            );
        }

        console.log("Upserting hotel info for hotel:", hotelId);

        // Upsert hotel info (create if doesn't exist, update if exists)
        const hotelInfo = await prisma.hotelInfo.upsert({
            where: { hotelId },
            update: {
                receptionNumber,
                emergencyNumber,
                checkInTime,
                checkOutTime,
                hotelDescription,
                amenities
            },
            create: {
                hotelId,
                receptionNumber,
                emergencyNumber,
                checkInTime,
                checkOutTime,
                hotelDescription,
                amenities: amenities || []
            }
        });

        return NextResponse.json({
            success: true,
            data: hotelInfo
        });
    } catch (error) {
        console.error("Error saving hotel basic info:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
