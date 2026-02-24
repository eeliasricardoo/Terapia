"use client"

import { useState, useEffect } from "react"

export function useRoomTimer(scheduledAt: string | undefined, durationMinutes: number | undefined) {
    const [remainingSeconds, setRemainingSeconds] = useState(0)

    useEffect(() => {
        if (!scheduledAt || !durationMinutes) return

        const startTime = new Date(scheduledAt).getTime()
        const endTime = startTime + (durationMinutes * 60000)

        const timer = setInterval(() => {
            const now = new Date().getTime()
            const diff = Math.floor((endTime - now) / 1000)

            if (diff > 0) {
                setRemainingSeconds(diff)
            } else {
                setRemainingSeconds(0)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [scheduledAt, durationMinutes])

    return remainingSeconds
}
