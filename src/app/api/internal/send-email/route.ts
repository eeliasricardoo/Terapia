/**
 * Internal async email dispatch endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/utils/email'
import { logger } from '@/lib/utils/logger'
import { env } from '@/lib/env'
import { timingSafeCompare } from '@/lib/security'
import { sendEmailSchema } from '@/lib/validations/api'

export async function POST(req: NextRequest) {
  // Validate the shared secret to block external requests
  const secret = req.headers.get('x-internal-secret')

  if (!timingSafeCompare(secret, env.INTERNAL_API_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = sendEmailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { to, subject, html } = validation.data

    // Send with retry — failure here is logged but doesn't affect the user
    const result = await sendEmail({ to, subject, html })
    if (!result.success) {
      logger.error(`[ASYNC-EMAIL] Failed to send to ${to}: ${result.error}`)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[API-INTERNAL-EMAIL-ERROR]', error)
    return NextResponse.json({ error: 'Invalid request body or server error' }, { status: 400 })
  }
}
