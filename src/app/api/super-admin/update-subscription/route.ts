import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hotelId, status } = await request.json();

    if (!hotelId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: hotelId, status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'cancelled', 'past_due'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, inactive, cancelled, past_due' },
        { status: 400 }
      );
    }

    // Update hotel subscription status
    const updatedHotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: { subscriptionStatus: status }
    });

    // Also update the subscription record if it exists
    const subscription = await prisma.subscription.findFirst({
      where: { hotelId: hotelId },
      orderBy: { createdAt: 'desc' }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status }
      });
    }

    // Log the admin action
    await prisma.analyticsEvent.create({
      data: {
        hotelId,
        eventType: 'subscription_status_updated',
        eventData: {
          previousStatus: updatedHotel.subscriptionStatus,
          newStatus: status,
          updatedBy: session.user.id,
          updatedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Hotel subscription status updated to ${status}`,
      hotel: {
        id: updatedHotel.id,
        name: updatedHotel.name,
        subscriptionStatus: updatedHotel.subscriptionStatus
      }
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
