import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ServiceRequestStatus, Priority } from "@prisma/client";

async function getAuthContext(request: NextRequest) {
    // Prefer headers injected by middleware for performance
    const headerUserId = request.headers.get("x-user-id");
    const headerRole = request.headers.get("x-user-role");
    const headerHotelId = request.headers.get("x-hotel-id");
    if (headerUserId && headerRole) {
        return {
            userId: headerUserId,
            role: headerRole,
            hotelId: headerHotelId
        } as const;
    }
    // Fallback to NextAuth or manual Bearer parsing
    const session = await auth();
    if (session?.user) {
        return {
            userId: session.user.id,
            role: session.user.role,
            hotelId: session.user.hotelId
        } as const;
    }
    const authHeader =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
            const payload = await verifyAccessToken<{
                role: string;
                hotelId?: string;
            }>(token);
            return {
                userId: payload.sub,
                role: payload.role,
                hotelId: payload.hotelId ?? null
            } as const;
        } catch {}
    }
    return { userId: null, role: null, hotelId: null } as const;
}

export async function GET(request: NextRequest) {
    try {
        const { role, hotelId } = await getAuthContext(request);
        if (
            !role ||
            !["hotel_staff", "hotel_admin"].includes(role) ||
            !hotelId
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");

        // Build where clause
        const whereClause: {
            hotelId: string;
            status?: ServiceRequestStatus;
            priority?: Priority;
        } = {
            hotelId
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
            orderBy: [{ priority: "desc" }, { requestedAt: "desc" }]
        });

        return NextResponse.json({
            success: true,
            serviceRequests
        });
    } catch (error) {
        console.error("Get staff service requests error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { role, hotelId } = await getAuthContext(request);
        if (
            !role ||
            !["hotel_staff", "hotel_admin"].includes(role) ||
            !hotelId
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { requestId, status, assignedStaffId } = body;

        if (!requestId) {
            return NextResponse.json(
                { error: "Request ID is required" },
                { status: 400 }
            );
        }

        // Verify the request belongs to the staff's hotel
        const serviceRequest = await prisma.serviceRequest.findFirst({
            where: {
                id: requestId,
                hotelId
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: "Service request not found or unauthorized" },
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
            if (status === "in_progress") {
                updateData.startedAt = new Date();
            } else if (status === "completed") {
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
        console.error("Update service request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { role, hotelId } = await getAuthContext(request);
        if (!role || role !== "hotel_admin" || !hotelId) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get("requestId");
        const roomId = searchParams.get("roomId");

        if (requestId) {
            // Delete a specific service request
            const serviceRequest = await prisma.serviceRequest.findFirst({
                where: {
                    id: requestId,
                    hotelId
                }
            });

            if (!serviceRequest) {
                return NextResponse.json(
                    { error: "Service request not found or unauthorized" },
                    { status: 404 }
                );
            }

            await prisma.serviceRequest.delete({
                where: { id: requestId }
            });

            return NextResponse.json({
                success: true,
                message: "Service request deleted successfully"
            });
        } else if (roomId) {
            // Delete all service requests for a specific room
            const deleteResult = await prisma.serviceRequest.deleteMany({
                where: {
                    roomId,
                    hotelId
                }
            });

            return NextResponse.json({
                success: true,
                message: `Deleted ${deleteResult.count} service requests for the room`
            });
        } else {
            return NextResponse.json(
                { error: "Either requestId or roomId is required" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Delete service request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
