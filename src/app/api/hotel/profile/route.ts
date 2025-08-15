import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hotelDetailsSchema } from "@/lib/validations";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const hotel = await prisma.hotel.findFirst({
            where: { adminId: session.user.id },
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
        const session = await auth();
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

        const { name, address, city, state, country, contactEmail, contactPhone, totalRooms } = validatedFields.data;

        // Update hotel
        const updatedHotel = await prisma.hotel.update({
            where: { adminId: session.user.id },
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
