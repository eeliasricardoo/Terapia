'use client'

import { useState, useEffect } from 'react'

// Returns null until the first client-side tick to avoid SSR/hydration mismatch
// (server and client clocks differ, so we never render a time value during SSR).
export function useRoomTimer(
  scheduledAt: string | undefined,
  durationMinutes: number | undefined
): number | null {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!scheduledAt || !durationMinutes) return

    const startTime = new Date(scheduledAt).getTime()
    const endTime = startTime + durationMinutes * 60000

    const tick = () => {
      const now = Date.now()
      const diff = Math.floor((endTime - now) / 1000)
      setRemainingSeconds(diff > 0 ? diff : 0)
    }

    tick() // Set immediately on mount (client only)
    const timer = setInterval(tick, 1000)

    return () => clearInterval(timer)
  }, [scheduledAt, durationMinutes])

  return remainingSeconds
}
