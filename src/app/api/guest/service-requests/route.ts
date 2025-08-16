import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serviceRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, serviceId, title, description, priority = 'medium' } = body;

        if (!bookingId || !serviceId || !title) {
            return NextResponse.json(
                { error: 'Booking ID, service ID, and title are required' },
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
                { error: 'Invalid request data', details: validationResult.error.issues },
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
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Create a guest user if one doesn't exist for this booking
        let guestId = booking.guestId;
        if (!guestId) {
            const guestUser = await prisma.user.create({
                data: {
                    email: booking.guestEmail,
                    name: booking.guestName,
                    phone: booking.guestPhone,
                    role: 'guest',
                    password: 'temp_password', // Guest users don't need real passwords
                    hotelId: booking.hotelId
                }
            });
            guestId = guestUser.id;

            // Update the booking with the guest ID
            await prisma.booking.update({
                where: { id: bookingId },
                data: { guestId }
            });
        }

        // Create the service request
        const serviceRequest = await prisma.serviceRequest.create({
            data: {
                title: validationResult.data.title,
                description: validationResult.data.description,
                priority: validationResult.data.priority,
                status: 'pending',
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
        console.error('Service request creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        // Get booking information
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking || !booking.guestId) {
            return NextResponse.json({
                success: true,
                serviceRequests: []
            });
        }

        // Get service requests for this guest and booking
        const serviceRequests = await prisma.serviceRequest.findMany({
            where: {
                guestId: booking.guestId,
                hotelId: booking.hotelId,
                roomId: booking.roomId
            },
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                requestedAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            serviceRequests
        });

    } catch (error) {
        console.error('Get service requests error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
