import { NextRequest, NextResponse } from 'next/server'
import { popFromEmailQueue } from '@/lib/utils/email-queue'
import { logger } from '@/lib/utils/logger'
import { timingSafeCompare } from '@/lib/security'

/**
 * Worker endpoint to process the email queue from Redis.
 * This can be triggered by:
 * 1. A fire-and-forget fetch after queuing an email.
 * 2. A Vercel Cron job every minute.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')

  if (!timingSafeCompare(secret, process.env.INTERNAL_API_SECRET ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Process up to 15 emails per invocation to avoid timeout
    const items = await popFromEmailQueue(15)

    if (items.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const sendUrl = `${appUrl}/api/internal/send-email`

    // Process in parallel but wait for all to finish (within this invocation)
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const emailId = item.id || 'unknown'
        try {
          const res = await fetch(sendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
            },
            body: JSON.stringify({
              to: item.to,
              subject: item.subject,
              html: item.html,
            }),
          })

          if (!res.ok) {
            const errText = await res.text()
            throw new Error(`Send failed: ${res.status} - ${errText}`)
          }
          return { id: emailId, success: true }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          logger.error(`[EMAIL-WORKER] Failed to send email ${emailId}:`, errMsg)
          // Note: In a more complex system, we would push back to queue if attempts < max
          throw err
        }
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    logger.info(
      `[EMAIL-WORKER] Finished processing batch. Succeeded: ${succeeded}, Failed: ${failed}`
    )

    return NextResponse.json({
      processed: items.length,
      succeeded,
      failed,
    })
  } catch (error) {
    logger.error('[EMAIL-WORKER] Critical error processing queue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Allow GET for easy testing/webhook if needed
export async function GET(req: NextRequest) {
  return POST(req)
}
