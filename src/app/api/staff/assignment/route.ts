import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Types for staff assignment
interface StaffWorkload {
    staffId: string;
    staffName: string;
    activeRequests: number;
    maxConcurrentRequests: number;
    isAvailable: boolean;
    lastAssignedAt?: Date;
}

interface AssignmentRequest {
    requestId: string;
    preferredStaffId?: string;
    forceAssign?: boolean; // Override availability checks
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin', 'hotel_staff'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { requestId, preferredStaffId, forceAssign = false }: AssignmentRequest = body;

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Verify the request exists and belongs to the hotel
        const serviceRequest = await prisma.serviceRequest.findFirst({
            where: {
                id: requestId,
                hotelId: session.user.hotelId,
                status: 'pending' // Only assign pending requests
            },
            include: {
                service: true,
                room: true
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found or already assigned' },
                { status: 404 }
            );
        }

        // Get all available staff for the hotel
        const availableStaff = await getAvailableStaff(session.user.hotelId);

        if (availableStaff.length === 0) {
            return NextResponse.json(
                { error: 'No staff available for assignment' },
                { status: 400 }
            );
        }

        let assignedStaffId: string;

        if (preferredStaffId) {
            // Check if preferred staff is available
            const preferredStaff = availableStaff.find(staff => staff.staffId === preferredStaffId);
            if (preferredStaff && (preferredStaff.isAvailable || forceAssign)) {
                assignedStaffId = preferredStaffId;
            } else {
                return NextResponse.json(
                    { error: 'Preferred staff is not available' },
                    { status: 400 }
                );
            }
        } else {
            // Use automatic assignment algorithm
            assignedStaffId = await getOptimalStaffAssignment(availableStaff, serviceRequest);
        }

        // Update the service request
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                assignedStaffId,
                status: 'in_progress',
                startedAt: new Date()
            },
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
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Log assignment for analytics
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'service_request_assigned',
                eventData: {
                    requestId: requestId,
                    assignedStaffId: assignedStaffId,
                    assignedBy: session.user.id,
                    assignmentMethod: preferredStaffId ? 'manual' : 'automatic',
                    priority: serviceRequest.priority,
                    serviceCategory: serviceRequest.service.category
                }
            }
        });

        // TODO: Send notification to assigned staff (implement in next iteration)

        return NextResponse.json({
            success: true,
            message: 'Request assigned successfully',
            serviceRequest: updatedRequest
        });

    } catch (error) {
        console.error('Staff assignment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin', 'hotel_staff'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const availableStaff = await getAvailableStaff(session.user.hotelId);

        return NextResponse.json({
            success: true,
            availableStaff
        });

    } catch (error) {
        console.error('Get available staff error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to get available staff with workload information
async function getAvailableStaff(hotelId: string): Promise<StaffWorkload[]> {
    const staff = await prisma.user.findMany({
        where: {
            hotelId: hotelId,
            role: { in: [UserRole.hotel_staff, UserRole.hotel_admin] }
        },
        select: {
            id: true,
            name: true,
            email: true,
            assignedRequests: {
                where: {
                    status: { in: ['pending', 'in_progress'] }
                },
                select: {
                    id: true,
                    status: true,
                    priority: true
                }
            }
        }
    });

    return staff.map(staffMember => ({
        staffId: staffMember.id,
        staffName: staffMember.name,
        activeRequests: staffMember.assignedRequests.length,
        maxConcurrentRequests: 5, // Default max, could be stored in user profile
        isAvailable: staffMember.assignedRequests.length < 5, // Simple availability check
        lastAssignedAt: undefined // TODO: Track last assignment time
    }));
}

// Smart assignment algorithm
async function getOptimalStaffAssignment(
    availableStaff: StaffWorkload[],
    serviceRequest: any
): Promise<string> {
    // Filter only available staff
    const eligibleStaff = availableStaff.filter(staff => staff.isAvailable);
    
    if (eligibleStaff.length === 0) {
        throw new Error('No eligible staff available');
    }

    // Priority-based assignment algorithm
    // 1. Staff with lowest current workload
    // 2. For equal workloads, use round-robin (TODO: implement proper round-robin)
    
    eligibleStaff.sort((a, b) => {
        // Primary sort: by current workload (ascending)
        if (a.activeRequests !== b.activeRequests) {
            return a.activeRequests - b.activeRequests;
        }
        
        // Secondary sort: by staff name for consistency
        return a.staffName.localeCompare(b.staffName);
    });

    // For high/urgent priority requests, prefer staff with lowest workload
    if (serviceRequest.priority === 'high' || serviceRequest.priority === 'urgent') {
        return eligibleStaff[0].staffId;
    }

    // For normal priority, use simple round-robin among staff with equal lowest workload
    const lowestWorkload = eligibleStaff[0].activeRequests;
    const staffWithLowestWorkload = eligibleStaff.filter(staff => staff.activeRequests === lowestWorkload);
    
    // Return first available (could implement more sophisticated round-robin later)
    return staffWithLowestWorkload[0].staffId;
}

// Manual reassignment endpoint
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin', 'hotel_staff'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { requestId, newStaffId, reason } = body;

        if (!requestId || !newStaffId) {
            return NextResponse.json(
                { error: 'Request ID and new staff ID are required' },
                { status: 400 }
            );
        }

        // Verify the request exists and belongs to the hotel
        const serviceRequest = await prisma.serviceRequest.findFirst({
            where: {
                id: requestId,
                hotelId: session.user.hotelId
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // Verify the new staff belongs to the same hotel
        const newStaff = await prisma.user.findFirst({
            where: {
                id: newStaffId,
                hotelId: session.user.hotelId,
                role: { in: [UserRole.hotel_staff, UserRole.hotel_admin] }
            }
        });

        if (!newStaff) {
            return NextResponse.json(
                { error: 'Staff member not found or invalid' },
                { status: 404 }
            );
        }

        // Update the assignment
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                assignedStaffId: newStaffId
            },
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Log reassignment for analytics
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'service_request_reassigned',
                eventData: {
                    requestId: requestId,
                    previousStaffId: serviceRequest.assignedStaffId,
                    newStaffId: newStaffId,
                    reassignedBy: session.user.id,
                    reason: reason || 'No reason provided'
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Request reassigned successfully',
            serviceRequest: updatedRequest
        });

    } catch (error) {
        console.error('Staff reassignment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
