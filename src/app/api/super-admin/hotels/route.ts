import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all hotels with their subscriptions and admin info
    const hotels = await prisma.hotel.findMany({
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            paymentOrders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include the latest subscription
    const transformedHotels = hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      country: hotel.country,
      contactEmail: hotel.contactEmail,
      contactPhone: hotel.contactPhone,
      totalRooms: hotel.totalRooms,
      subscriptionPlan: hotel.subscriptionPlan,
      subscriptionStatus: hotel.subscriptionStatus,
      createdAt: hotel.createdAt,
      admin: hotel.admin,
      subscription: hotel.subscriptions[0] || null,
      _count: hotel._count
    }));

    return NextResponse.json({ hotels: transformedHotels });

  } catch (error) {
    console.error('Get hotels error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
