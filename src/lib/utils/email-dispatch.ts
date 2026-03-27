/**
 * Async email dispatcher
 *
 * Sends emails via the internal /api/internal/send-email route
 * in a truly fire-and-forget fashion. The calling server action
 * does NOT await this — it returns immediately, keeping the
 * user-facing response fast.
 *
 * Requires INTERNAL_API_SECRET and NEXT_PUBLIC_APP_URL in the environment.
 */

import { logger } from './logger'
import { pushToEmailQueue } from './email-queue'
import { redis } from '@/lib/upstash/redis'

type EmailPayload = {
  to: string
  subject: string
  html: string
}

/**
 * Dispatches an email asynchronously without blocking the caller.
 * Now uses a Redis Queue for guaranteed delivery.
 */
export async function dispatchEmailAsync(payload: EmailPayload): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const secret = process.env.INTERNAL_API_SECRET

  // Standard delivery via Redis Queue (Highly Recommended)
  if (redis) {
    const pushed = await pushToEmailQueue(payload)
    if (pushed) {
      logger.info(`[EMAIL-DISPATCH] Queued for ${payload.to}`, { subject: payload.subject })

      // Auto-trigger the worker via fetch (fire-and-forget)
      // If this fetch fails, the cron job will eventually pick it up.
      if (appUrl && secret) {
        fetch(`${appUrl}/api/internal/process-email-queue`, {
          method: 'POST',
          headers: { 'x-internal-secret': secret },
        }).catch(() => {}) // We don't care if it fails here
      }
      return
    }
  }

  // FALLBACK: Old fetch mechanism if Redis is down or not configured
  if (!appUrl || !secret) {
    logger.warn('[EMAIL-DISPATCH] No Redis and no API Secret. Email DROPPED!', payload.to)
    return
  }

  const url = `${appUrl}/api/internal/send-email`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': secret,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    logger.error('[EMAIL-DISPATCH] Fallback fetch failed:', err?.message)
  })
}
