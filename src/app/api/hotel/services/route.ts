import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServiceCategory } from "@prisma/client";

interface ServiceData {
    name: string;
    description: string;
    category: string;
    icon?: string;
    isActive?: boolean;
}

export async function GET(request: NextRequest) {
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

        const services = await prisma.service.findMany({
            where: { hotelId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            success: true,
            services
        });

    } catch (error) {
        console.error("Services fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized - Only hotel admins can create services" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, category, icon, isActive } = body as ServiceData;

        if (!name || !description || !category) {
            return NextResponse.json(
                { error: "Name, description, and category are required" },
                { status: 400 }
            );
        }

        // Get hotel ID
        let hotelId = session.user.hotelId;
        
        if (!hotelId) {
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

        // Validate category
        const validCategories = Object.values(ServiceCategory);
        const categoryValue = category.toLowerCase() as ServiceCategory;
        
        if (!validCategories.includes(categoryValue)) {
            return NextResponse.json(
                { error: "Invalid category. Must be one of: " + validCategories.join(", ") },
                { status: 400 }
            );
        }

        // Check if service name already exists for this hotel
        const existingService = await prisma.service.findFirst({
            where: {
                hotelId,
                name: name.trim()
            }
        });

        if (existingService) {
            return NextResponse.json(
                { error: "A service with this name already exists" },
                { status: 409 }
            );
        }

        // Create the service
        const service = await prisma.service.create({
            data: {
                name: name.trim(),
                description: description.trim(),
                category: categoryValue,
                icon: icon || "🏨",
                isActive: isActive !== undefined ? isActive : true,
                hotelId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Service created successfully",
            service
        });

    } catch (error) {
        console.error("Service creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
