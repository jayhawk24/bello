import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServiceCategory } from "@prisma/client";

interface ServiceUpdateData {
    name?: string;
    description?: string;
    category?: string;
    icon?: string;
    isActive?: boolean;
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

        // Get hotel ID
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

        const service = await prisma.service.findFirst({
            where: {
                id: params.id,
                hotelId
            }
        });

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            service
        });

    } catch (error) {
        console.error("Service fetch error:", error);
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
                { error: "Unauthorized - Only hotel admins can update services" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, category, icon, isActive } = body as ServiceUpdateData;

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

        // Verify service belongs to the hotel
        const existingService = await prisma.service.findFirst({
            where: {
                id: params.id,
                hotelId
            }
        });

        if (!existingService) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = name.trim();
            
            // Check if new name conflicts with existing service
            const nameConflict = await prisma.service.findFirst({
                where: {
                    hotelId,
                    name: name.trim(),
                    id: { not: params.id }
                }
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: "A service with this name already exists" },
                    { status: 409 }
                );
            }
        }

        if (description !== undefined) {
            updateData.description = description.trim();
        }

        if (category !== undefined) {
            // Validate category
            const validCategories = Object.values(ServiceCategory);
            const categoryValue = category.toLowerCase() as ServiceCategory;
            
            if (!validCategories.includes(categoryValue)) {
                return NextResponse.json(
                    { error: "Invalid category. Must be one of: " + validCategories.join(", ") },
                    { status: 400 }
                );
            }
            
            updateData.category = categoryValue;
        }

        if (icon !== undefined) {
            updateData.icon = icon;
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // Update the service
        const updatedService = await prisma.service.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: "Service updated successfully",
            service: updatedService
        });

    } catch (error) {
        console.error("Service update error:", error);
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
                { error: "Unauthorized - Only hotel admins can delete services" },
                { status: 401 }
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

        // Verify service belongs to the hotel
        const existingService = await prisma.service.findFirst({
            where: {
                id: params.id,
                hotelId
            }
        });

        if (!existingService) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        // Check if service has active requests
        const activeRequests = await prisma.serviceRequest.count({
            where: {
                serviceId: params.id,
                status: { in: ['pending', 'in_progress'] }
            }
        });

        if (activeRequests > 0) {
            return NextResponse.json(
                { error: `Cannot delete service with ${activeRequests} active requests. Complete or cancel them first.` },
                { status: 400 }
            );
        }

        // Delete the service
        await prisma.service.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        console.error("Service deletion error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
