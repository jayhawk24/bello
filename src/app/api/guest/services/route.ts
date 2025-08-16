import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('bookingId');
        const hotelId = searchParams.get('hotelId');

        let targetHotelId = hotelId;

        // If bookingId is provided, get hotel from booking
        if (bookingId && !hotelId) {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                select: { hotelId: true }
            });

            if (!booking) {
                return NextResponse.json(
                    { error: 'Booking not found' },
                    { status: 404 }
                );
            }

            targetHotelId = booking.hotelId;
        }

        if (!targetHotelId) {
            return NextResponse.json(
                { error: 'Hotel ID or Booking ID is required' },
                { status: 400 }
            );
        }

        // Get hotel-specific services
        const services = await prisma.service.findMany({
            where: {
                hotelId: targetHotelId,
                isActive: true
            },
            orderBy: {
                category: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            services
        });

    } catch (error) {
        console.error('Get services error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
