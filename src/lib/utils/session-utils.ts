/**
 * Pure utility functions for session-related time logic.
 * This file is meant to be shared between client and server components.
 */

export function isWithinSessionWindow(
  scheduledAt: Date | string,
  durationMinutes: number
): {
  allowed: boolean
  reason?: 'too_early' | 'too_late' | 'not_scheduled'
} {
  const now = new Date()
  const start = new Date(scheduledAt)
  // Window opens 10 minutes before
  const windowStart = new Date(start.getTime() - 10 * 60 * 1000)
  // Window closes exactly at the end of the duration
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  if (now < windowStart) return { allowed: false, reason: 'too_early' }
  if (now > end) return { allowed: false, reason: 'too_late' }

  return { allowed: true }
}
