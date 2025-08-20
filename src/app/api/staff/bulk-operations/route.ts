import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceRequestStatus, Priority } from '@prisma/client';

interface BulkOperation {
    requestIds: string[];
    action: 'assign' | 'update_status' | 'update_priority' | 'complete' | 'cancel';
    data?: {
        assignedStaffId?: string;
        status?: ServiceRequestStatus;
        priority?: Priority;
        reason?: string;
    };
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
        const { requestIds, action, data }: BulkOperation = body;

        if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return NextResponse.json(
                { error: 'Request IDs array is required' },
                { status: 400 }
            );
        }

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        // Verify all requests belong to the hotel
        const serviceRequests = await prisma.serviceRequest.findMany({
            where: {
                id: { in: requestIds },
                hotelId: session.user.hotelId
            },
            include: {
                service: true,
                guest: { select: { name: true, email: true } },
                room: { select: { roomNumber: true } }
            }
        });

        if (serviceRequests.length !== requestIds.length) {
            return NextResponse.json(
                { error: 'Some requests not found or unauthorized' },
                { status: 404 }
            );
        }

        let updateData: any = {};
        const results: any[] = [];
        const errors: any[] = [];

        switch (action) {
            case 'assign':
                if (!data?.assignedStaffId) {
                    return NextResponse.json(
                        { error: 'Assigned staff ID is required for assignment' },
                        { status: 400 }
                    );
                }

                // Verify staff belongs to the hotel
                const staff = await prisma.user.findFirst({
                    where: {
                        id: data.assignedStaffId,
                        hotelId: session.user.hotelId,
                        role: { in: ['hotel_staff', 'hotel_admin'] }
                    }
                });

                if (!staff) {
                    return NextResponse.json(
                        { error: 'Staff member not found or invalid' },
                        { status: 404 }
                    );
                }

                updateData = {
                    assignedStaffId: data.assignedStaffId,
                    status: 'in_progress',
                    startedAt: new Date()
                };
                break;

            case 'update_status':
                if (!data?.status) {
                    return NextResponse.json(
                        { error: 'Status is required for status update' },
                        { status: 400 }
                    );
                }

                updateData = { status: data.status };
                
                if (data.status === 'in_progress') {
                    updateData.startedAt = new Date();
                } else if (data.status === 'completed') {
                    updateData.completedAt = new Date();
                }
                break;

            case 'update_priority':
                if (!data?.priority) {
                    return NextResponse.json(
                        { error: 'Priority is required for priority update' },
                        { status: 400 }
                    );
                }
                updateData = { priority: data.priority };
                break;

            case 'complete':
                updateData = {
                    status: 'completed',
                    completedAt: new Date()
                };
                break;

            case 'cancel':
                updateData = {
                    status: 'cancelled'
                };
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        // Process each request individually to handle potential errors
        for (const serviceRequest of serviceRequests) {
            try {
                // Additional validation based on current status
                if (action === 'assign' && serviceRequest.status !== 'pending') {
                    errors.push({
                        requestId: serviceRequest.id,
                        error: `Request is ${serviceRequest.status}, cannot assign`
                    });
                    continue;
                }

                if (action === 'complete' && serviceRequest.status !== 'in_progress') {
                    errors.push({
                        requestId: serviceRequest.id,
                        error: `Request is ${serviceRequest.status}, cannot complete`
                    });
                    continue;
                }

                const updatedRequest = await prisma.serviceRequest.update({
                    where: { id: serviceRequest.id },
                    data: updateData,
                    include: {
                        assignedStaff: {
                            select: { id: true, name: true }
                        },
                        guest: {
                            select: { name: true, email: true }
                        },
                        room: {
                            select: { roomNumber: true }
                        },
                        service: {
                            select: { name: true, category: true }
                        }
                    }
                });

                results.push({
                    requestId: serviceRequest.id,
                    success: true,
                    data: updatedRequest
                });

                // Log the bulk operation for each request
                await prisma.analyticsEvent.create({
                    data: {
                        hotelId: session.user.hotelId,
                        eventType: `bulk_${action}`,
                        eventData: {
                            requestId: serviceRequest.id,
                            action: action,
                            performedBy: session.user.id,
                            previousData: {
                                status: serviceRequest.status,
                                priority: serviceRequest.priority,
                                assignedStaffId: serviceRequest.assignedStaffId
                            },
                            newData: updateData,
                            reason: data?.reason || 'Bulk operation'
                        }
                    }
                });

            } catch (requestError) {
                console.error(`Error processing request ${serviceRequest.id}:`, requestError);
                errors.push({
                    requestId: serviceRequest.id,
                    error: 'Failed to update request'
                });
            }
        }

        const summary = {
            totalRequests: requestIds.length,
            successful: results.length,
            failed: errors.length,
            action: action
        };

        // Create overall analytics event for the bulk operation
        await prisma.analyticsEvent.create({
            data: {
                hotelId: session.user.hotelId,
                eventType: 'bulk_operation_completed',
                eventData: {
                    action: action,
                    performedBy: session.user.id,
                    summary: summary,
                    requestIds: requestIds,
                    timestamp: new Date()
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Bulk ${action} completed`,
            summary: summary,
            results: results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Bulk operations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint for bulk operation status/history
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin', 'hotel_staff'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get recent bulk operations from analytics
        const bulkOperations = await prisma.analyticsEvent.findMany({
            where: {
                hotelId: session.user.hotelId,
                eventType: 'bulk_operation_completed'
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                hotel: {
                    select: { name: true }
                }
            }
        });

        // Get the user who performed each operation
        const bulkOpsWithUserInfo = await Promise.all(
            bulkOperations.map(async (op) => {
                const performedBy = (op.eventData as any)?.performedBy;
                let user = null;
                
                if (performedBy) {
                    user = await prisma.user.findUnique({
                        where: { id: performedBy },
                        select: { name: true, email: true }
                    });
                }

                return {
                    ...op,
                    performedBy: user
                };
            })
        );

        return NextResponse.json({
            success: true,
            bulkOperations: bulkOpsWithUserInfo,
            pagination: {
                limit,
                offset,
                hasMore: bulkOperations.length === limit
            }
        });

    } catch (error) {
        console.error('Get bulk operations history error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
