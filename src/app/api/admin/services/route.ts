import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceCategory } from '@prisma/client';

interface ServiceCreationData {
    name: string;
    description: string;
    category: ServiceCategory;
    icon?: string;
    estimatedDuration?: number; // in minutes
    isActive?: boolean;
    availabilityHours?: {
        start: string; // "09:00"
        end: string;   // "22:00"
    };
    availableDays?: number[]; // 0-6 (Sunday-Saturday)
    requiredStaffCount?: number;
    instructions?: string;
    price?: number; // in cents/paise
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const includeDefault = searchParams.get('includeDefault') === 'true';
        const category = searchParams.get('category') as ServiceCategory;
        const isActive = searchParams.get('isActive');

        // Build where clause
        const whereClause: any = {
            OR: [
                { hotelId: session.user.hotelId }, // Hotel-specific services
            ]
        };

        // Include default services if requested
        if (includeDefault) {
            whereClause.OR.push({ hotelId: null });
        }

        if (category) {
            whereClause.category = category;
        }

        if (isActive !== null && isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                hotel: {
                    select: { name: true }
                },
                _count: {
                    select: {
                        serviceRequests: {
                            where: {
                                requestedAt: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
                            }
                        }
                    }
                }
            },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            services: services.map(service => ({
                ...service,
                usageCount: (service as any)._count.serviceRequests,
                isCustom: !!service.hotelId,
                hotelName: (service as any).hotel?.name
            }))
        });

    } catch (error) {
        console.error('Get services error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            description,
            category,
            icon = '🛎️',
            estimatedDuration = 30,
            isActive = true,
            availabilityHours,
            availableDays,
            requiredStaffCount = 1,
            instructions,
            price
        }: ServiceCreationData = body;

        if (!name || !description || !category) {
            return NextResponse.json(
                { error: 'Name, description, and category are required' },
                { status: 400 }
            );
        }

        // Check for duplicate service name in the hotel
        const existingService = await prisma.service.findFirst({
            where: {
                name: name,
                hotelId: session.user.hotelId
            }
        });

        if (existingService) {
            return NextResponse.json(
                { error: 'A service with this name already exists' },
                { status: 409 }
            );
        }

        // Validate availability hours format
        if (availabilityHours) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(availabilityHours.start) || !timeRegex.test(availabilityHours.end)) {
                return NextResponse.json(
                    { error: 'Invalid time format. Use HH:MM format' },
                    { status: 400 }
                );
            }
        }

        // Validate available days
        if (availableDays && (!Array.isArray(availableDays) || availableDays.some(day => day < 0 || day > 6))) {
            return NextResponse.json(
                { error: 'Available days must be an array of numbers 0-6' },
                { status: 400 }
            );
        }

        // Create the service with additional metadata stored in a JSON field
        // Note: We'll need to add these fields to the schema or store in JSON
        const serviceData: any = {
            name,
            description,
            category,
            icon,
            isActive,
            hotelId: session.user.hotelId
        };

        const service = await prisma.service.create({
            data: serviceData,
            include: {
                hotel: {
                    select: { name: true }
                }
            }
        });

        // Log service creation
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'custom_service_created',
                eventData: {
                    serviceId: service.id,
                    serviceName: name,
                    category: category,
                    createdBy: session.user.id,
                    estimatedDuration,
                    requiredStaffCount,
                    price
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Custom service created successfully',
            service: {
                ...service,
                estimatedDuration,
                availabilityHours,
                availableDays,
                requiredStaffCount,
                instructions,
                price,
                isCustom: true
            }
        });

    } catch (error) {
        console.error('Create service error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { serviceId, ...updateData } = body;

        if (!serviceId) {
            return NextResponse.json(
                { error: 'Service ID is required' },
                { status: 400 }
            );
        }

        // Verify the service belongs to the hotel
        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                hotelId: session.user.hotelId
            }
        });

        if (!existingService) {
            return NextResponse.json(
                { error: 'Service not found or unauthorized' },
                { status: 404 }
            );
        }

        // Update only allowed fields
        const allowedFields = ['name', 'description', 'category', 'icon', 'isActive'];
        const filteredUpdateData: any = {};
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdateData[key] = updateData[key];
            }
        });

        if (Object.keys(filteredUpdateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: filteredUpdateData,
            include: {
                hotel: {
                    select: { name: true }
                }
            }
        });

        // Log service update
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'custom_service_updated',
                eventData: {
                    serviceId: serviceId,
                    updatedBy: session.user.id,
                    previousData: existingService,
                    newData: filteredUpdateData
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Service updated successfully',
            service: updatedService
        });

    } catch (error) {
        console.error('Update service error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        if (!serviceId) {
            return NextResponse.json(
                { error: 'Service ID is required' },
                { status: 400 }
            );
        }

        // Verify the service belongs to the hotel
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                hotelId: session.user.hotelId
            },
            include: {
                _count: {
                    select: {
                        serviceRequests: true
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found or unauthorized' },
                { status: 404 }
            );
        }

        // Check if service has active requests
        const activeRequestsCount = await prisma.serviceRequest.count({
            where: {
                serviceId: serviceId,
                status: { in: ['pending', 'in_progress'] }
            }
        });

        if (activeRequestsCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete service with ${activeRequestsCount} active requests` },
                { status: 400 }
            );
        }

        // Soft delete by setting isActive to false instead of actual deletion
        const deletedService = await prisma.service.update({
            where: { id: serviceId },
            data: { isActive: false }
        });

        // Log service deletion
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'custom_service_deleted',
                eventData: {
                    serviceId: serviceId,
                    serviceName: service.name,
                    category: service.category,
                    deletedBy: session.user.id,
                    requestCount: service._count.serviceRequests
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully',
            service: deletedService
        });

    } catch (error) {
        console.error('Delete service error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
