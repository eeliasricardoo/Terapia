'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, isBefore, startOfDay, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { PsychologistWithProfile } from '@/lib/supabase/types'
import type { PsychologistAvailability } from '@/lib/actions/availability'

export function usePsychologistProfile(
  psychologist: PsychologistWithProfile,
  availability: PsychologistAvailability | null
) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly'>('monthly')

  const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 150
  const monthlyPricePerSession = price * 0.8
  const monthlyTotal = monthlyPricePerSession * 4
  const displayPrice = selectedPlan === 'single' ? price : monthlyPricePerSession

  const timezone = availability?.timezone || 'America/Sao_Paulo'
  const today = toZonedTime(new Date(), timezone)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const todayStr = format(today, 'yyyy-MM-dd')

  const isDayAvailable = (date: Date) => {
    if (!availability) return false

    const dateStr = format(date, 'yyyy-MM-dd')
    if (dateStr < todayStr) return false

    if (availability.overrides[dateStr]) {
      return (
        availability.overrides[dateStr].type === 'custom' &&
        availability.overrides[dateStr].slots.length > 0
      )
    }

    if (!availability.weeklySchedule) return false
    const dayOfWeekIndex = date.getDay()
    const daysMap = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const
    const dayKey = daysMap[dayOfWeekIndex]
    const wsDay = (availability.weeklySchedule as any)[dayKey]
    return wsDay?.enabled && wsDay.slots.length > 0
  }

  // Find first available day
  const initialAvailableDay = useMemo(() => {
    const daysCount = getDaysInMonth(currentDate)
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    const startFrom = isCurrentMonth ? today.getDate() : 1

    for (let d = startFrom; d <= daysCount; d++) {
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d)
      if (isDayAvailable(checkDate)) return d
    }
    return null
  }, [currentDate, availability])

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Sync selectedDay with initialAvailableDay on mount or month change if current selection is invalid
  useEffect(() => {
    if (initialAvailableDay) {
      if (
        !selectedDay ||
        !isDayAvailable(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay))
      ) {
        setSelectedDay(initialAvailableDay)
      }
    } else {
      setSelectedDay(null)
    }
  }, [initialAvailableDay, currentDate])

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
    setSelectedDay(null)
    setSelectedTime(null)
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
    setSelectedDay(null)
    setSelectedTime(null)
  }

  const getAvailableSlotsForDay = (date: Date) => {
    if (!availability || !isDayAvailable(date)) return []

    const dateStr = format(date, 'yyyy-MM-dd')
    let slotsDef: { start: string; end: string }[] = []

    const ws = availability.weeklySchedule as any
    if (availability.overrides[dateStr] && availability.overrides[dateStr].type === 'custom') {
      slotsDef = availability.overrides[dateStr].slots
    } else if (ws) {
      const dayOfWeekIndex = date.getDay()
      const daysMap = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ] as const
      const dayKey = daysMap[dayOfWeekIndex]
      slotsDef = ws[dayKey]?.slots || []
    }

    const durationMinutes = ws?.sessionDuration ? parseInt(ws.sessionDuration) : 50
    const breakMinutes = ws?.breakDuration !== undefined ? parseInt(ws.breakDuration) : 10
    let generatedSlots: string[] = []

    const apptsOnThisDay = (availability.appointments || []).filter((appt) => {
      const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
      return format(zonedAppt, 'yyyy-MM-dd') === dateStr
    })

    const nowZoned = toZonedTime(new Date(), timezone)
    const isToday = format(nowZoned, 'yyyy-MM-dd') === dateStr
    const nowMinutes = nowZoned.getHours() * 60 + nowZoned.getMinutes()

    slotsDef.forEach((slot) => {
      let current = new Date(`1970-01-01T${slot.start}:00`)
      const end = new Date(`1970-01-01T${slot.end}:00`)

      while (current < end) {
        const hour = current.getHours().toString().padStart(2, '0')
        const min = current.getMinutes().toString().padStart(2, '0')
        const slotStartMin = current.getHours() * 60 + current.getMinutes()
        const slotEndMin = slotStartMin + durationMinutes

        // Check availability window
        const hasConflict = apptsOnThisDay.some((appt) => {
          const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
          const apptStartMin = zonedAppt.getHours() * 60 + zonedAppt.getMinutes()
          const apptEndMin = apptStartMin + appt.duration_minutes
          return slotStartMin < apptEndMin && slotEndMin > apptStartMin
        })

        const isPast = isToday && slotStartMin <= nowMinutes + 30

        if (
          !hasConflict &&
          !isPast &&
          slotStartMin + durationMinutes <= end.getHours() * 60 + end.getMinutes()
        ) {
          generatedSlots.push(`${hour}:${min}`)
        }

        current = addMinutes(current, durationMinutes + breakMinutes)
        if (addMinutes(current, durationMinutes) > end) break
      }
    })
    return generatedSlots
  }

  const availableSlotsForSelectedDay = useMemo(() => {
    return selectedDay
      ? getAvailableSlotsForDay(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
        )
      : []
  }, [selectedDay, currentDate, availability])

  return {
    selectedDay,
    setSelectedDay,
    currentDate,
    setCurrentDate,
    selectedTime,
    setSelectedTime,
    selectedPlan,
    setSelectedPlan,
    pricing: { price, monthlyPricePerSession, monthlyTotal, displayPrice },
    calendar: {
      handlePrevMonth,
      handleNextMonth,
      daysInMonth: getDaysInMonth(currentDate),
      currentMonthName: new Intl.DateTimeFormat('pt-BR', { month: 'long' })
        .format(currentDate)
        .replace(/^\w/, (c) => c.toUpperCase()),
      currentYear: currentDate.getFullYear(),
      isDayAvailable,
      availableSlotsForSelectedDay,
    },
    timezone,
  }
}
