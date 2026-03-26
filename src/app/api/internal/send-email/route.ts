/**
 * Internal async email dispatch endpoint.
 *
 * This route is called fire-and-forget from server actions so that
 * email sending does NOT block the user-facing booking/cancel flow.
 *
 * Security:
 *  - Requires a shared secret header (INTERNAL_API_SECRET) so it cannot
 *    be called from the public internet.
 *  - Only accepts POST requests with a JSON body.
 *
 * Usage (from server actions):
 *   fetch('/api/internal/send-email', { method: 'POST', body: JSON.stringify(payload), ... })
 *   .catch(() => {}) // truly fire and forget
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/utils/email'
import { logger } from '@/lib/utils/logger'
import { env } from '@/lib/env'

type EmailPayload = {
  to: string
  subject: string
  html: string
}

export async function POST(req: NextRequest) {
  // Validate the shared secret to block external requests
  const secret = req.headers.get('x-internal-secret')

  if (secret !== env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: EmailPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, subject, html } = payload
  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: 'Missing required fields: to, subject, html' },
      { status: 400 }
    )
  }

  // Send with retry — failure here is logged but doesn't affect the user
  const result = await sendEmail({ to, subject, html })
  if (!result.success) {
    logger.error(`[ASYNC-EMAIL] Failed to send to ${to}: ${result.error}`)
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
