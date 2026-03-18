'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, isBefore, startOfDay, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { PsychologistWithProfile } from '@/lib/supabase/types'
import type { PsychologistAvailability } from '@/lib/actions/availability'

export function usePsychologistProfile(
  psychologist: PsychologistWithProfile,
  availability: PsychologistAvailability | null,
  initialTime: string | null = null
) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime)
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

  const getAvailableSlotsForDay = (date: Date) => {
    if (!availability) return []

    const dateStr = format(date, 'yyyy-MM-dd')

    // 1. Check if the day is outdated
    if (dateStr < todayStr) return []

    // 2. Check if the day is blocked in overrides
    if (availability.overrides[dateStr] && availability.overrides[dateStr].type === 'blocked') {
      return []
    }

    // 3. Get slot definitions (from custom overrides or weekly schedule)
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
      const wsDay = ws[dayKey]
      if (!wsDay?.enabled) return []
      slotsDef = wsDay.slots || []
    }

    if (slotsDef.length === 0) return []

    // 4. Calculate free slots considering duration, breaks and existing appointments
    const durationMinutes = ws?.sessionDuration ? parseInt(ws.sessionDuration) : 50
    const breakMinutes = ws?.breakDuration !== undefined ? parseInt(ws.breakDuration) : 10
    const generatedSlots: string[] = []

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

        // Overlap check
        const hasConflict = apptsOnThisDay.some((appt) => {
          const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
          const apptStartMin = zonedAppt.getHours() * 60 + zonedAppt.getMinutes()
          const apptEndMin = apptStartMin + (appt.duration_minutes || durationMinutes)
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

  const isDayAvailable = (date: Date) => {
    return getAvailableSlotsForDay(date).length > 0
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
      firstDayOfMonth: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
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
