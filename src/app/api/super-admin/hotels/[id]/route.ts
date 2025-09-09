import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const hotelId = params.id;

    // Fetch detailed hotel information
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            isOccupied: true
          },
          orderBy: { roomNumber: 'asc' }
        },
        paymentOrders: {
          include: {
            payments: {
              select: {
                id: true,
                status: true,
                amount: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 payment orders
        },
        serviceRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            requestedAt: true
          },
          orderBy: { requestedAt: 'desc' },
          take: 10 // Last 10 service requests
        },
        _count: {
          select: {
            rooms: true,
            serviceRequests: true,
            paymentOrders: true
          }
        }
      }
    });

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Transform the data to include the latest subscription
    const transformedHotel = {
      ...hotel,
      subscription: hotel.subscriptions?.[0] || null
    };

    return NextResponse.json({ hotel: transformedHotel });

  } catch (error) {
    console.error('Get hotel details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
