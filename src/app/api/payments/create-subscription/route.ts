import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, billingCycle, roomTier } = await request.json();

    // Validate required fields
    if (!planType || !billingCycle || !roomTier) {
      return NextResponse.json(
        { error: 'Missing required fields: planType, billingCycle, roomTier' },
        { status: 400 }
      );
    }

    // Get user's hotel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedHotel: true }
    });

    if (!user?.managedHotel) {
      return NextResponse.json(
        { error: 'Hotel not found for user' },
        { status: 404 }
      );
    }

    const hotel = user.managedHotel;

    // Calculate amount based on plan type and billing cycle
    const planPricing = {
      'basic': { monthly: 4900, yearly: 52900 }, // ₹49/₹529
      'premium': { monthly: 12900, yearly: 139900 }, // ₹129/₹1399
      'enterprise': { monthly: 24900, yearly: 269900 } // ₹249/₹2699
    };

    const amount = planPricing[planType as keyof typeof planPricing]?.[billingCycle as keyof typeof planPricing.basic];
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Invalid plan type or billing cycle' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const orderResponse = await createPaymentOrder(
      amount,
      'INR',
      `subscription_${hotel.id}_${Date.now()}`
    );

    // Create payment order in database
    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        hotelId: hotel.id,
        razorpayOrderId: orderResponse.id,
        amount,
        currency: 'INR',
        status: 'created',
        receipt: orderResponse.receipt,
        notes: {
          planType,
          billingCycle,
          roomTier
        }
      }
    });

    // Create or update subscription record (initially inactive)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (billingCycle === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Check if subscription already exists for this hotel
    const existingSubscription = await prisma.subscription.findFirst({
      where: { hotelId: hotel.id }
    });

    let subscription;
    if (existingSubscription) {
      subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType,
          billingCycle,
          roomTier,
          amount,
          currency: 'INR',
          currentPeriodStart,
          currentPeriodEnd,
        }
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          hotelId: hotel.id,
          planType,
          billingCycle,
          roomTier,
          amount,
          currency: 'INR',
          status: 'inactive', // Will be activated on successful payment
          currentPeriodStart,
          currentPeriodEnd,
        }
      });
    }

    // Link payment order to subscription
    await prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: { subscriptionId: subscription.id }
    });

    return NextResponse.json({
      orderId: orderResponse.id,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: 'Bello Hotel Concierge',
      description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}`,
      prefill: {
        name: user.name,
        email: user.email,
        contact: hotel.contactPhone
      },
      theme: {
        color: '#D4AF37'
      }
    });

  } catch (error) {
    console.error('Create subscription payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
