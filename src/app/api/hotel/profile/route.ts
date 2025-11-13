import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hotelDetailsSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
    try {
        // Prefer middleware-injected headers (for mobile Bearer auth)
        const headerUserId = request.headers.get("x-user-id");
        const headerRole = request.headers.get("x-user-role");
        let session = null as any;
        if (!headerUserId || headerRole !== "hotel_admin") {
            session = await getServerSession(authOptions);
        }
        if (
            headerRole !== "hotel_admin" &&
            (!session || session.user.role !== "hotel_admin")
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get the user with hotel information
        const userId = headerUserId || session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                managedHotel: {
                    include: {
                        _count: {
                            select: {
                                rooms: true,
                                staff: true,
                                serviceRequests: true
                            }
                        }
                    }
                },
                hotel: true
            }
        });

        // Get the hotel - prioritize managed hotel, then assigned hotel
        let hotel = user?.managedHotel;
        if (!hotel) {
            // Try finding by adminId as fallback
            hotel = await prisma.hotel.findFirst({
                where: { adminId: userId },
                include: {
                    _count: {
                        select: {
                            rooms: true,
                            staff: true,
                            serviceRequests: true
                        }
                    }
                }
            });
        }

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            hotel: {
                ...hotel,
                roomCount: hotel._count.rooms,
                staffCount: hotel._count.staff,
                requestCount: hotel._count.serviceRequests
            }
        });
    } catch (error) {
        console.error("Hotel profile error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input data
        const validatedFields = hotelDetailsSchema.safeParse(body);
        if (!validatedFields.success) {
            return NextResponse.json(
                {
                    error: "Invalid input data",
                    details: validatedFields.error.issues
                },
                { status: 400 }
            );
        }

        const {
            name,
            address,
            city,
            state,
            country,
            contactEmail,
            contactPhone,
            totalRooms
        } = validatedFields.data;

        // Get the user with hotel information
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

        // Get the hotel - prioritize managed hotel, then try adminId lookup
        let hotel = user.managedHotel;
        if (!hotel) {
            hotel = await prisma.hotel.findFirst({
                where: { adminId: session.user.id }
            });
        }

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Update hotel
        const updatedHotel = await prisma.hotel.update({
            where: { id: hotel.id },
            data: {
                name,
                address,
                city,
                state,
                country,
                contactEmail,
                contactPhone,
                totalRooms
            }
        });

        return NextResponse.json({
            success: true,
            message: "Hotel profile updated successfully",
            hotel: updatedHotel
        });
    } catch (error) {
        console.error("Hotel update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
