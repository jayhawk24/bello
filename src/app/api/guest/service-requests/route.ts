import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceRequestSchema } from "@/lib/validations";
import { notifyStaffNewServiceRequest } from "@/lib/notifications";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            bookingId,
            serviceId,
            title,
            description,
            priority = "medium"
        } = body;

        if (!bookingId || !serviceId || !title) {
            return NextResponse.json(
                { error: "Booking ID, service ID, and title are required" },
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

        // Get booking information
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                room: true,
                guest: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Do not create a user for unauthenticated guests; use existing guestId if present
        const guestId = booking.guestId ?? null;

        // Create the service request
        const serviceRequest = await prisma.serviceRequest.create({
            data: {
                title: validationResult.data.title,
                description: validationResult.data.description,
                priority: validationResult.data.priority,
                status: "pending",
                serviceId: serviceId,
                guestId,
                hotelId: booking.hotelId,
                roomId: booking.roomId
            },
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
                hotelId: booking.hotelId,
                guest: {
                    name:
                        booking.guestName ||
                        serviceRequest.guest?.name ||
                        "Guest"
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
        console.error("Service request creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get("bookingId");

        if (!bookingId) {
            return NextResponse.json(
                { error: "Booking ID is required" },
                { status: 400 }
            );
        }

        // Get booking information
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Get service requests for this booking's room and time window.
        // If booking.guestId exists, include it as an additional filter.
        const where: any = {
            hotelId: booking.hotelId,
            roomId: booking.roomId,
            requestedAt: {
                gte: booking.checkInDate,
                lte: booking.checkOutDate
            }
        };
        if (booking.guestId) where.guestId = booking.guestId;

        const serviceRequests = await prisma.serviceRequest.findMany({
            where,
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        name: true
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
        console.error("Get service requests error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
