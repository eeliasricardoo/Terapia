"use client"

import { useState, useMemo } from "react"
import { format, isBefore, startOfDay, addMinutes } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import type { PsychologistWithProfile } from "@/lib/supabase/types"
import type { PsychologistAvailability } from "@/lib/actions/availability"

export function usePsychologistProfile(psychologist: PsychologistWithProfile, availability: PsychologistAvailability | null) {
    const [selectedDay, setSelectedDay] = useState<number>(15)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly'>('monthly')

    const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 150
    const monthlyPricePerSession = price * 0.8
    const monthlyTotal = monthlyPricePerSession * 4
    const displayPrice = selectedPlan === 'single' ? price : monthlyPricePerSession

    const timezone = availability?.timezone || "America/Sao_Paulo"
    const today = toZonedTime(new Date(), timezone)

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
        setSelectedDay(1)
    }

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
        setSelectedDay(1)
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const isDayAvailable = (date: Date) => {
        if (!availability) return false
        if (isBefore(date, startOfDay(today))) return false

        const dateStr = format(date, 'yyyy-MM-dd')
        if (availability.overrides[dateStr]) {
            return availability.overrides[dateStr].type === 'custom' && availability.overrides[dateStr].slots.length > 0
        }

        if (!availability.weeklySchedule) return false
        const dayOfWeekIndex = date.getDay()
        const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
        const dayKey = daysMap[dayOfWeekIndex]
        return availability.weeklySchedule[dayKey]?.enabled && availability.weeklySchedule[dayKey].slots.length > 0
    }

    const getAvailableSlotsForDay = (date: Date) => {
        if (!availability || !isDayAvailable(date)) return []

        const dateStr = format(date, 'yyyy-MM-dd')
        let slotsDef: { start: string, end: string }[] = []

        if (availability.overrides[dateStr] && availability.overrides[dateStr].type === 'custom') {
            slotsDef = availability.overrides[dateStr].slots
        } else if (availability.weeklySchedule) {
            const dayOfWeekIndex = date.getDay()
            const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
            const dayKey = daysMap[dayOfWeekIndex]
            slotsDef = availability.weeklySchedule[dayKey]?.slots || []
        }

        const durationMinutes = availability.weeklySchedule?.sessionDuration ? parseInt(availability.weeklySchedule.sessionDuration) : 50
        const breakMinutes = 10
        let generatedSlots: string[] = []

        const apptsOnThisDay = (availability.appointments || []).filter(appt => {
            const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
            return format(zonedAppt, 'yyyy-MM-dd') === dateStr
        })

        const nowZoned = toZonedTime(new Date(), timezone)
        const isToday = format(nowZoned, 'yyyy-MM-dd') === dateStr
        const nowMinutes = nowZoned.getHours() * 60 + nowZoned.getMinutes()

        slotsDef.forEach(slot => {
            let current = new Date(`1970-01-01T${slot.start}:00`)
            const end = new Date(`1970-01-01T${slot.end}:00`)

            while (current < end) {
                const hour = current.getHours().toString().padStart(2, '0')
                const min = current.getMinutes().toString().padStart(2, '0')
                const slotStartMin = current.getHours() * 60 + current.getMinutes()
                const slotEndMin = slotStartMin + durationMinutes

                const hasConflict = apptsOnThisDay.some(appt => {
                    const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
                    const apptStartMin = zonedAppt.getHours() * 60 + zonedAppt.getMinutes()
                    const apptEndMin = apptStartMin + appt.duration_minutes
                    return (slotStartMin < apptEndMin) && (slotEndMin > apptStartMin)
                })

                const isPast = isToday && (slotStartMin <= nowMinutes + 30)

                if (!hasConflict && !isPast) {
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
            ? getAvailableSlotsForDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay))
            : []
    }, [selectedDay, currentDate, availability])

    return {
        selectedDay, setSelectedDay,
        currentDate, setCurrentDate,
        selectedTime, setSelectedTime,
        selectedPlan, setSelectedPlan,
        pricing: { price, monthlyPricePerSession, monthlyTotal, displayPrice },
        calendar: {
            handlePrevMonth,
            handleNextMonth,
            daysInMonth: getDaysInMonth(currentDate),
            currentMonthName: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate).replace(/^\w/, c => c.toUpperCase()),
            currentYear: currentDate.getFullYear(),
            isDayAvailable,
            availableSlotsForSelectedDay
        },
        timezone
    }
}
