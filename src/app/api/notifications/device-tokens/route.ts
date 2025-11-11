import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceToken, platform } = body;
    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken required' }, { status: 400 });
    }

    const normalizedPlatform = typeof platform === 'string' ? platform : 'android';

    // @ts-expect-error Prisma client types not yet generated for DeviceToken model
    const record = await prisma.deviceToken.upsert({
      where: { token: deviceToken },
      update: { userId: session.user.id, platform: normalizedPlatform },
      create: { token: deviceToken, userId: session.user.id, platform: normalizedPlatform }
    });

    return NextResponse.json({ success: true, deviceToken: record.token });
  } catch (error) {
    console.error('Register device token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const deviceToken = searchParams.get('deviceToken');
    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken query param required' }, { status: 400 });
    }
    // @ts-expect-error Prisma client types not yet generated for DeviceToken model
    await prisma.deviceToken.delete({ where: { token: deviceToken } }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete device token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
