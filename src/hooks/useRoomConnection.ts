'use client'
import { logger } from '@/lib/utils/logger'
import { useState, useEffect, useRef } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'

export interface AppointmentInfo {
  scheduledAt: string
  durationMinutes: number
  isPsychologist: boolean
}

export function useRoomConnection(appointmentId: string) {
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)

  // Guard against redundant fetches
  const lastFetchedId = useRef<string | null>(null)
  const isSettingUp = useRef(false)

  // 1. Fetch Token
  useEffect(() => {
    // Only fetch if ID changed or we haven't fetched yet
    if (!appointmentId || lastFetchedId.current === appointmentId) {
      if (lastFetchedId.current === appointmentId) {
        setIsLoading(false) // Already done
      }
      return
    }

    async function init() {
      try {
        setIsLoading(true)
        lastFetchedId.current = appointmentId
        logger.debug(`Fetching room info for: ${appointmentId}`)

        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId }),
        })

        if (!res.ok) {
          const errorText = await res.text()
          let errorMessage = errorText || 'Falha ao obter token da sala'
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.error) errorMessage = errorJson.error
          } catch (e) {}
          throw new Error(errorMessage)
        }

        const data = await res.json()
        setRoomUrl(data.url)
        setToken(data.token)
        setAppointmentInfo({
          scheduledAt: data.scheduledAt,
          durationMinutes: data.durationMinutes,
          isPsychologist: data.isPsychologist,
        })
      } catch (err: unknown) {
        logger.error('Failed to init room connection:', err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [appointmentId])

  // 2. Setup Call Object
  useEffect(() => {
    if (!roomUrl || !token || isSettingUp.current) return

    // If we already have a call object and it matches our current URL, don't recreate it
    // Actually Daily CallObjects can only be loaded once with a specific URL usually.
    // If the URL changed, we MUST recreate.

    const setupCall = async () => {
      try {
        isSettingUp.current = true
        const existingCall = DailyIframe.getCallInstance()

        if (existingCall) {
          // Check if it's already usable or needs destruction
          const state = existingCall.meetingState()
          // Valid initial states: 'new', 'loading', 'loaded', 'joining-meeting', 'joined-meeting', 'left-meeting', 'error'
          if (state !== 'left-meeting' && state !== 'error') {
            logger.debug(`Existing Daily instance state: ${state} - destroying for fresh start`)
            await existingCall.destroy()
          }
        }

        logger.debug('Creating new Daily call object')
        const newCo = DailyIframe.createCallObject()
        setCallObject(newCo)
      } catch (err) {
        logger.error('Error in setupCall', err)
      } finally {
        isSettingUp.current = false
      }
    }

    setupCall()

    return () => {
      // We don't destroy here to avoid loops. Total destruction should happen on unmount of VideoRoomPage.
    }
  }, [roomUrl, token])

  return {
    appointmentInfo,
    error,
    isLoading: isLoading || (!roomUrl && !error),
    callObject,
    roomUrl,
    token,
  }
}
