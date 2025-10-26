import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionBillingService } from '@/lib/subscriptionBilling';

// This endpoint will be called by a cron job service (like Vercel Cron, GitHub Actions, or external cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron job authentication
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting subscription billing cron job via API...');

    // Run the subscription billing process
    await SubscriptionBillingService.runSubscriptionBilling();

    return NextResponse.json({
      success: true,
      message: 'Subscription billing completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Subscription billing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with admin access
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Manual triggers not allowed in production' },
        { status: 403 }
      );
    }

    console.log('🧪 Manual test of subscription billing...');
    
    // Run the subscription billing process
    await SubscriptionBillingService.runSubscriptionBilling();

    return NextResponse.json({
      success: true,
      message: 'Manual subscription billing test completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Manual cron test error:', error);
    return NextResponse.json(
      { 
        error: 'Manual subscription billing test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
