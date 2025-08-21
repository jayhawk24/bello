import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's hotel and subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        managedHotel: {
          include: {
            subscriptions: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!user?.managedHotel) {
      return NextResponse.json(
        { error: 'Hotel not found for user' },
        { status: 404 }
      );
    }

    const hotel = user.managedHotel;
    const subscription = hotel.subscriptions[0] || null;

    return NextResponse.json({
      hotel: {
        id: hotel.id,
        name: hotel.name,
        totalRooms: hotel.totalRooms,
        subscriptionPlan: hotel.subscriptionPlan,
        subscriptionStatus: hotel.subscriptionStatus
      },
      subscription: subscription ? {
        id: subscription.id,
        planType: subscription.planType,
        billingCycle: subscription.billingCycle,
        roomTier: subscription.roomTier,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt
      } : null
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
