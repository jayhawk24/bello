import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { endpoint, keys, userAgent } = body || {}
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent || null,
      userId: session.user.id,
      isActive: true,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent || null,
      userId: session.user.id,
      isActive: true,
    },
  })

  return NextResponse.json({ success: true })
}
