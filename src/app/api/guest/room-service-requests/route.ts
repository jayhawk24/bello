import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceRequestSchema } from "@/lib/validations";
import { notifyStaffNewServiceRequest } from "@/lib/notifications";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            roomId,
            hotelId,
            serviceId,
            title,
            description,
            priority = "medium",
            guestName,
            guestEmail
        } = body;

        if (!roomId || !hotelId || !serviceId || !title) {
            return NextResponse.json(
                {
                    error: "Room ID, hotel ID, service ID, and title are required"
                },
                { status: 400 }
            );
        }

        // Validate the request data
        const validationResult = serviceRequestSchema.safeParse({
            serviceId,
            title,
            description,
            priority
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid request data",
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        // Verify room exists and get room info
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { hotel: true }
        });

        if (!room || room.hotelId !== hotelId) {
            return NextResponse.json(
                { error: "Invalid room or hotel information" },
                { status: 404 }
            );
        }

        // Find the actual service by ID
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.hotelId !== hotelId) {
            return NextResponse.json(
                { error: "Service not found or not available for this hotel" },
                { status: 404 }
            );
        }

        // Try to find existing guest user (do not create a user for unauthenticated guests)
        let guestUser = null as null | {
            id: string;
            name: string | null;
            email: string | null;
        };
        if (guestEmail) {
            const existing = await prisma.user.findFirst({
                where: {
                    email: guestEmail,
                    hotelId: hotelId
                },
                select: { id: true, name: true, email: true }
            });
            if (existing) guestUser = existing;
        }

        // Create the service request
        const serviceRequest = await prisma.serviceRequest.create({
            data: {
                title: validationResult.data.title,
                description: validationResult.data.description,
                priority: validationResult.data.priority,
                status: "pending",
                serviceId: serviceId,
                guestId: guestUser?.id ?? null,
                hotelId: hotelId,
                roomId: roomId
            },
            include: {
                guest: guestUser
                    ? {
                          select: {
                              id: true,
                              name: true,
                              email: true
                          }
                      }
                    : false,
                room: {
                    select: {
                        id: true,
                        roomNumber: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: true
                    }
                }
            }
        });

        // Send notifications to all staff members
        try {
            await notifyStaffNewServiceRequest({
                id: serviceRequest.id,
                title: serviceRequest.title,
                priority: serviceRequest.priority,
                hotelId: hotelId,
                guest: {
                    name: guestName || serviceRequest.guest?.name || "Guest"
                },
                room: {
                    roomNumber: serviceRequest.room.roomNumber
                },
                service: {
                    name: serviceRequest.service.name,
                    category: serviceRequest.service.category
                }
            });
        } catch (notificationError) {
            // Don't fail the request if notification fails
            console.error("Failed to send notifications:", notificationError);
        }

        return NextResponse.json({
            success: true,
            serviceRequest: {
                id: serviceRequest.id,
                title: serviceRequest.title,
                description: serviceRequest.description,
                priority: serviceRequest.priority,
                status: serviceRequest.status,
                serviceId: serviceRequest.serviceId,
                requestedAt: serviceRequest.requestedAt,
                guest: serviceRequest.guest,
                room: serviceRequest.room,
                service: serviceRequest.service
            }
        });
    } catch (error) {
        console.error("Room service request creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("roomId");
        const hotelId = searchParams.get("hotelId");

        if (!roomId || !hotelId) {
            return NextResponse.json(
                { error: "Room ID and Hotel ID are required" },
                { status: 400 }
            );
        }

        // Get service requests for this room
        const serviceRequests = await prisma.serviceRequest.findMany({
            where: {
                roomId: roomId,
                hotelId: hotelId
            },
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                service: {
                    select: {
                        name: true,
                        category: true,
                        icon: true
                    }
                }
            },
            orderBy: {
                requestedAt: "desc"
            }
        });

        return NextResponse.json({
            success: true,
            serviceRequests
        });
    } catch (error) {
        console.error("Get room service requests error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
