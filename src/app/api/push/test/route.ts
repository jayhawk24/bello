import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendPushToUser } from '@/lib/push'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventKey = `test:${session.user.id}:${Date.now()}`
  await sendPushToUser(session.user.id, {
    title: 'Test notification',
    body: 'This is a test push',
    eventKey,
    data: { target: '/dashboard/requests' },
  })

  return NextResponse.json({ success: true })
}
