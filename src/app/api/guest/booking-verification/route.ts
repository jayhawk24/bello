import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        // Find the booking by ID
        const booking = await prisma.booking.findFirst({
            where: {
                OR: [
                    { id: bookingId },
                    { bookingReference: bookingId }
                ]
            },
            include: {
                room: {
                    include: {
                        hotel: {
                            select: {
                                id: true,
                                name: true,
                                contactEmail: true,
                                contactPhone: true
                            }
                        }
                    }
                },
                guest: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if booking is active (checked in but not checked out)
        const now = new Date();
        const isActiveBooking = booking.status === 'checked_in' || 
                               (booking.status === 'confirmed' && booking.checkInDate <= now && booking.checkOutDate >= now);

        if (!isActiveBooking) {
            return NextResponse.json(
                { error: 'Booking is not currently active' },
                { status: 400 }
            );
        }

        // Create a guest session if one doesn't exist (only if guestId exists)
        let guestSession = null;
        if (booking.guestId) {
            guestSession = await prisma.guestSession.findFirst({
                where: {
                    guestId: booking.guestId,
                    hotelId: booking.hotelId,
                    roomId: booking.roomId,
                    expiresAt: {
                        gt: new Date() // Session hasn't expired
                    }
                }
            });

            if (!guestSession) {
                // Generate a session token
                const sessionToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
                const expiresAt = new Date(booking.checkOutDate);

                guestSession = await prisma.guestSession.create({
                    data: {
                        guestId: booking.guestId,
                        hotelId: booking.hotelId,
                        roomId: booking.roomId,
                        sessionToken,
                        expiresAt
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                bookingReference: booking.bookingReference,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                status: booking.status,
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                room: {
                    id: booking.room.id,
                    roomNumber: booking.room.roomNumber,
                    roomType: booking.room.roomType,
                    hotel: booking.room.hotel
                },
                guest: booking.guest,
                sessionToken: guestSession?.sessionToken
            }
        });

    } catch (error) {
        console.error('Booking verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
