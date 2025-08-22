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
            networkName,
            password,
            description,
            isPublic,
            bandwidth,
            coverage,
            instructions
        } = body;

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel ID is required" },
                { status: 400 }
            );
        }

        if (!networkName?.trim()) {
            return NextResponse.json(
                { error: "Network name is required" },
                { status: 400 }
            );
        }

        // Verify the user has access to this hotel
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                managedHotel: true,
                hotel: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this hotel
        const hasAccess =
            user.managedHotel?.id === hotelId || user.hotel?.id === hotelId;

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied to this hotel" },
                { status: 403 }
            );
        }

        // Ensure hotel info exists
        let hotelInfo = await prisma.hotelInfo.findUnique({
            where: { hotelId }
        });

        if (!hotelInfo) {
            hotelInfo = await prisma.hotelInfo.create({
                data: {
                    hotelId,
                    amenities: []
                }
            });
        }

        // Create WiFi network
        const wifiNetwork = await prisma.hotelWifi.create({
            data: {
                hotelInfoId: hotelInfo.id,
                networkName: networkName.trim(),
                password: password?.trim() || null,
                description: description?.trim() || null,
                isPublic: isPublic || false,
                bandwidth: bandwidth?.trim() || null,
                coverage: coverage?.trim() || null,
                instructions: instructions?.trim() || null
            }
        });

        return NextResponse.json({
            success: true,
            data: wifiNetwork
        });
    } catch (error) {
        console.error("Error adding WiFi network:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
