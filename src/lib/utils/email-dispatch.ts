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

type EmailPayload = {
  to: string
  subject: string
  html: string
}

/**
 * Dispatches an email asynchronously without blocking the caller.
 * Errors are swallowed intentionally — failures are logged in the API route.
 */
export function dispatchEmailAsync(payload: EmailPayload): void {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const secret = process.env.INTERNAL_API_SECRET

  if (!appUrl || !secret) {
    // Fallback: log a warning and do nothing. Avoids crashing in environments
    // where the variables are not yet configured.
    logger.warn(
      '[EMAIL-DISPATCH] NEXT_PUBLIC_APP_URL or INTERNAL_API_SECRET not set. Email not dispatched.',
      { to: payload.to, subject: payload.subject }
    )
    return
  }

  const url = `${appUrl}/api/internal/send-email`

  // Fire and forget — intentionally not awaited
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': secret,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    logger.error('[EMAIL-DISPATCH] Failed to dispatch email:', {
      to: payload.to,
      subject: payload.subject,
      error: err?.message || err,
    })
  })
}
