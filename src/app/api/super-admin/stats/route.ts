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

    // Get total hotels count
    const totalHotels = await prisma.hotel.count();

    // Get active subscriptions count
    const activeSubscriptions = await prisma.hotel.count({
      where: { subscriptionStatus: 'active' }
    });

    // Get total revenue from all payments
    const payments = await prisma.payment.findMany({
      where: { status: 'captured' },
      select: { amount: true }
    });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get pending payments count
    const pendingPayments = await prisma.paymentOrder.count({
      where: { status: 'created' }
    });

    // Get plan distribution
    const planDistribution = await prisma.hotel.groupBy({
      by: ['subscriptionPlan'],
      _count: {
        subscriptionPlan: true
      }
    });

    const planDistributionMap = planDistribution.reduce((acc, plan) => {
      acc[plan.subscriptionPlan] = plan._count.subscriptionPlan;
      return acc;
    }, {} as Record<string, number>);

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = await prisma.hotel.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueByMonth = await prisma.payment.findMany({
      where: {
        status: 'captured',
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // Group revenue by month
    const monthlyRevenue = revenueByMonth.reduce((acc, payment) => {
      const monthYear = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      acc[monthYear] = (acc[monthYear] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalHotels,
      activeSubscriptions,
      totalRevenue,
      pendingPayments,
      planDistribution: planDistributionMap,
      recentSignups,
      monthlyRevenue
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
