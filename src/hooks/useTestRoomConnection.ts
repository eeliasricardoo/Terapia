'use client'
import { logger } from '@/lib/utils/logger'
import { useState, useEffect, useRef } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { AppointmentInfo } from './useRoomConnection'

export function useTestRoomConnection(role: 'psychologist' | 'patient' | null) {
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)

  const isSettingUp = useRef(false)

  // 1. Fetch Token when role is selected
  useEffect(() => {
    if (!role) return

    async function init() {
      try {
        setIsLoading(true)
        logger.debug(`Fetching test room info for role: ${role}`)

        const res = await fetch('/api/video/test-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(errorText || 'Falha ao obter token da sala de teste')
        }

        const data = await res.json()
        setRoomUrl(data.url)
        setToken(data.token)
        setAppointmentInfo({
          scheduledAt: data.scheduledAt,
          durationMinutes: data.durationMinutes,
          isPsychologist: data.isPsychologist,
        })
      } catch (err: any) {
        logger.error('Failed to init test room connection:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [role])

  // 2. Setup Call Object
  useEffect(() => {
    if (!roomUrl || !token || isSettingUp.current) return

    const setupCall = async () => {
      try {
        isSettingUp.current = true
        const existingCall = DailyIframe.getCallInstance()

        if (existingCall) {
          const state = existingCall.meetingState()
          if (state !== 'left-meeting' && state !== 'error') {
            await existingCall.destroy()
          }
        }

        const newCo = DailyIframe.createCallObject()
        setCallObject(newCo)
      } catch (err) {
        logger.error('Error in setupCall', err)
      } finally {
        isSettingUp.current = false
      }
    }

    setupCall()
  }, [roomUrl, token])

  return {
    appointmentInfo,
    error,
    isLoading: isLoading || (role && !roomUrl && !error),
    callObject,
    roomUrl,
    token,
  }
}
