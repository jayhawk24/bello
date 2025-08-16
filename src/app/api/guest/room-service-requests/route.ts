import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serviceRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomId, hotelId, serviceId, title, description, priority = 'medium', guestName, guestEmail } = body;

        if (!roomId || !hotelId || !serviceId || !title) {
            return NextResponse.json(
                { error: 'Room ID, hotel ID, service ID, and title are required' },
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

        // Verify room exists and get room info
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { hotel: true }
        });

        if (!room || room.hotelId !== hotelId) {
            return NextResponse.json(
                { error: 'Invalid room or hotel information' },
                { status: 404 }
            );
        }

        // Find the actual service by ID 
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.hotelId !== hotelId) {
            return NextResponse.json(
                { error: 'Service not found or not available for this hotel' },
                { status: 404 }
            );
        }

        // Try to find existing guest user or create one for room access
        let guestUser = null;
        if (guestEmail) {
            guestUser = await prisma.user.findFirst({
                where: { 
                    email: guestEmail,
                    hotelId: hotelId
                }
            });
        }

        // If no guest user found, create a room guest account
        if (!guestUser) {
            const roomGuestEmail = guestEmail || `room_${roomId}_guest@${room.hotel.name.toLowerCase().replace(/\s+/g, '')}.local`;
            guestUser = await prisma.user.create({
                data: {
                    email: roomGuestEmail,
                    name: guestName || `Room ${room.roomNumber} Guest`,
                    role: 'guest',
                    password: 'room_access_guest', // Temporary password for room guests
                    hotelId: hotelId
                }
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
                guestId: guestUser.id,
                hotelId: hotelId,
                roomId: roomId
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
        console.error('Room service request creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const hotelId = searchParams.get('hotelId');

        if (!roomId || !hotelId) {
            return NextResponse.json(
                { error: 'Room ID and Hotel ID are required' },
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
                requestedAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            serviceRequests
        });

    } catch (error) {
        console.error('Get room service requests error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
