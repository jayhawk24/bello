import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get hotel ID from query parameter
        const { searchParams } = new URL(request.url);
        const hotelId = searchParams.get("hotelId");

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

        // Get or create hotel info with all related data
        let hotelInfo = await prisma.hotelInfo.findUnique({
            where: { hotelId },
            include: {
                wifiInfos: true,
                tvGuides: {
                    include: {
                        channels: true
                    }
                },
                foodMenus: {
                    include: {
                        menuItems: true
                    }
                }
            }
        });

        // If no hotel info exists, create a default one
        if (!hotelInfo) {
            // Use upsert to avoid racing with other requests creating default info
            hotelInfo = await prisma.hotelInfo.upsert({
                where: { hotelId },
                update: {},
                create: {
                    hotelId,
                    amenities: []
                },
                include: {
                    wifiInfos: true,
                    tvGuides: {
                        include: {
                            channels: true
                        }
                    },
                    foodMenus: {
                        include: {
                            menuItems: true
                        }
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                hotelInfo,
                wifiNetworks: hotelInfo.wifiInfos,
                tvGuides: hotelInfo.tvGuides,
                foodMenus: hotelInfo.foodMenus
            }
        });
    } catch (error) {
        console.error("Error fetching hotel setup data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
