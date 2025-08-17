import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceRequestStatus, Priority } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        
        // Build where clause
        const whereClause: {
            hotelId: string;
            status?: ServiceRequestStatus;
            priority?: Priority;
        } = {
            hotelId: session.user.hotelId
        };

        if (status) {
            whereClause.status = status as ServiceRequestStatus;
        }

        if (priority) {
            whereClause.priority = priority as Priority;
        }

        // Get service requests for the staff's hotel
        const serviceRequests = await prisma.serviceRequest.findMany({
            where: whereClause,
            include: {
                guest: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        roomType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        description: true
                    }
                },
                assignedStaff: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { requestedAt: 'desc' }
            ]
        });

        return NextResponse.json({
            success: true,
            serviceRequests
        });

    } catch (error) {
        console.error('Get staff service requests error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { requestId, status, assignedStaffId } = body;

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Verify the request belongs to the staff's hotel
        const serviceRequest = await prisma.serviceRequest.findFirst({
            where: {
                id: requestId,
                hotelId: session.user.hotelId
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found or unauthorized' },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: {
            status?: ServiceRequestStatus;
            startedAt?: Date;
            completedAt?: Date;
            assignedStaffId?: string | null;
        } = {};
        
        if (status) {
            updateData.status = status;
            if (status === 'in_progress') {
                updateData.startedAt = new Date();
            } else if (status === 'completed') {
                updateData.completedAt = new Date();
            }
        }

        if (assignedStaffId !== undefined) {
            updateData.assignedStaffId = assignedStaffId;
        }

        // Update the service request
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: updateData,
            include: {
                guest: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        roomType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: true
                    }
                },
                assignedStaff: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            serviceRequest: updatedRequest
        });

    } catch (error) {
        console.error('Update service request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
