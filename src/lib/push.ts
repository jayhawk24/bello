import webPush from 'web-push'
import { prisma } from '@/lib/prisma'

type PushPayload = {
  title: string
  body?: string
  data?: any
  tag?: string
  eventKey: string
}

let configured = false

function ensureConfigured() {
  if (configured) return
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@localhost'

  if (!publicKey || !privateKey) {
    // Avoid throwing in build; runtime send will error clearly
    console.warn('VAPID keys are not set. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.')
  } else {
    webPush.setVapidDetails(subject, publicKey, privateKey)
    configured = true
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureConfigured()
  const subs = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true },
  })

  if (!subs.length) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            data: payload.data,
            tag: payload.tag || payload.eventKey,
            eventKey: payload.eventKey,
          }),
        )
        sent++
        // Touch lastUsedAt
        await prisma.pushSubscription.update({
          where: { endpoint: s.endpoint },
          data: { lastUsedAt: new Date() },
        })
      } catch (err: any) {
        failed++
        const status = err?.statusCode || err?.status
        if (status === 404 || status === 410) {
          // Endpoint gone, deactivate to avoid future errors
          await prisma.pushSubscription.update({
            where: { endpoint: s.endpoint },
            data: { isActive: false },
          })
        } else {
          console.error('Push send error', status, err?.message)
        }
      }
    }),
  )

  return { sent, failed }
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.all(userIds.map((id) => sendPushToUser(id, payload)))
  return results.reduce(
    (acc, r) => ({ sent: acc.sent + r.sent, failed: acc.failed + r.failed }),
    { sent: 0, failed: 0 },
  )
}

export function getPublicVapidKey() {
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) console.warn('VAPID_PUBLIC_KEY is not set')
  return key || ''
}
