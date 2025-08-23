import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get hotel ID - for hotel_admin, they manage a hotel
        let hotelId = session.user.hotelId;

        // If no hotelId in session, try to find the hotel they manage
        if (!hotelId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: { managedHotel: true }
            });

            if (user?.managedHotel) {
                hotelId = user.managedHotel.id;
            }
        }

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found for user" },
                { status: 404 }
            );
        }

        const wifiId = id;

        // Verify the WiFi network belongs to the hotel
        const wifiNetwork = await prisma.hotelWifi.findFirst({
            where: {
                id: wifiId,
                hotelInfo: {
                    hotelId: hotelId
                }
            }
        });

        if (!wifiNetwork) {
            return NextResponse.json(
                { error: "WiFi network not found" },
                { status: 404 }
            );
        }

        // Delete the WiFi network
        await prisma.hotelWifi.delete({
            where: { id: wifiId }
        });

        return NextResponse.json({
            success: true,
            message: "WiFi network deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting WiFi network:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
