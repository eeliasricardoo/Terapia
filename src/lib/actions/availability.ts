'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { format, isBefore, startOfDay, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

import {
  WeeklyScheduleSchema,
  WeeklyScheduleData,
  TimeSlot,
  PsychologistAvailability,
  TimeSlotSchema,
  DayScheduleSchema,
} from '@/lib/validations/availability'

const getAvailabilitySchema = z.object({
  userId: z.string().uuid(),
})

const getAvailableSlotsSchema = z.object({
  userId: z.string().uuid(),
  dateStr: z.string(), // YYYY-MM-DD
})

const updateAvailabilitySchema = z.object({
  weeklySchedule: WeeklyScheduleSchema,
  sessionDuration: z.string(),
  breakDuration: z.string(),
  timezone: z.string(),
  overrides: z.record(
    z.object({
      type: z.enum(['blocked', 'custom']),
      slots: z.array(TimeSlotSchema),
    })
  ),
})

/**
 * Fetches psychologist availability including weekly schedule, overrides and appointments.
 */
export const getPsychologistAvailability = createSafeAction(getAvailabilitySchema, async (data) => {
  const profile = await prisma.psychologistProfile.findFirst({
    where: {
      OR: [{ id: data.userId }, { userId: data.userId }],
    },
    select: {
      id: true,
      weeklySchedule: true,
      timezone: true,
      userId: true,
    },
  })

  if (!profile) return null

  const psychologistProfileId = profile.id
  const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const overridesList = await prisma.scheduleOverride.findMany({
    where: {
      psychologistId: psychologistProfileId,
      date: { gte: recentPastDate },
    },
  })

  const overridesMap: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}
  overridesList.forEach((o) => {
    overridesMap[o.date] = {
      type: o.type as 'blocked' | 'custom',
      slots: (o.slots as unknown as TimeSlot[]) || [],
    }
  })

  const appointmentList = await prisma.appointment.findMany({
    where: {
      psychologistId: psychologistProfileId,
      status: { notIn: ['CANCELED'] },
      scheduledAt: { gte: new Date(recentPastDate) },
    },
    select: {
      id: true,
      scheduledAt: true,
      durationMinutes: true,
    },
  })

  return {
    timezone: profile.timezone || 'America/Sao_Paulo',
    weeklySchedule: (profile.weeklySchedule as unknown as WeeklyScheduleData) || null,
    overrides: overridesMap,
    appointments: appointmentList.map((a) => ({
      id: a.id,
      scheduled_at: a.scheduledAt.toISOString(),
      duration_minutes: a.durationMinutes,
    })),
  }
})

/**
 * Generates available time slots for a specific date.
 */
export const getAvailableTimeSlots = createSafeAction(getAvailableSlotsSchema, async (data) => {
  const availabilityRes = await getPsychologistAvailability({ userId: data.userId })
  if (!availabilityRes.success || !availabilityRes.data) return []

  const availability = availabilityRes.data
  const date = new Date(data.dateStr)
  const timezone = availability.timezone || 'America/Sao_Paulo'
  const today = toZonedTime(new Date(), timezone)

  if (isBefore(date, startOfDay(today))) return []

  let isAvailable = false
  if (availability.overrides[data.dateStr]) {
    isAvailable =
      availability.overrides[data.dateStr].type === 'custom' &&
      availability.overrides[data.dateStr].slots.length > 0
  } else if (availability.weeklySchedule) {
    const daysMap = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const
    const dayKey = daysMap[date.getDay()]
    isAvailable = !!(
      availability.weeklySchedule[dayKey]?.enabled &&
      availability.weeklySchedule[dayKey].slots.length > 0
    )
  }

  if (!isAvailable) return []

  let slotsDef: TimeSlot[] = []
  if (
    availability.overrides[data.dateStr] &&
    availability.overrides[data.dateStr].type === 'custom'
  ) {
    slotsDef = availability.overrides[data.dateStr].slots
  } else if (availability.weeklySchedule) {
    const daysMap = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const
    const dayKey = daysMap[date.getDay()]
    slotsDef = availability.weeklySchedule[dayKey]?.slots || []
  }

  const durationMinutes = availability.weeklySchedule?.sessionDuration
    ? parseInt(availability.weeklySchedule.sessionDuration)
    : 50
  const breakMinutes = 10
  const generatedSlots: string[] = []

  const apptsOnThisDay = availability.appointments.filter((appt) => {
    const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
    return format(zonedAppt, 'yyyy-MM-dd') === data.dateStr
  })

  const nowZoned = toZonedTime(new Date(), timezone)
  const isToday = format(nowZoned, 'yyyy-MM-dd') === data.dateStr
  const nowMinutes = nowZoned.getHours() * 60 + nowZoned.getMinutes()

  slotsDef.forEach((slot) => {
    let current = new Date(`1970-01-01T${slot.start}:00`)
    const end = new Date(`1970-01-01T${slot.end}:00`)

    while (current < end) {
      const hour = current.getHours().toString().padStart(2, '0')
      const min = current.getMinutes().toString().padStart(2, '0')
      const slotStartMin = current.getHours() * 60 + current.getMinutes()
      const slotEndMin = slotStartMin + durationMinutes

      const hasConflict = apptsOnThisDay.some((appt) => {
        const zonedAppt = toZonedTime(new Date(appt.scheduled_at), timezone)
        const apptStartMin = zonedAppt.getHours() * 60 + zonedAppt.getMinutes()
        const apptEndMin = apptStartMin + appt.duration_minutes
        return slotStartMin < apptEndMin && slotEndMin > apptStartMin
      })

      const isPast = isToday && slotStartMin <= nowMinutes + 30

      if (!hasConflict && !isPast) {
        generatedSlots.push(`${hour}:${min}`)
      }

      current = addMinutes(current, durationMinutes + breakMinutes)
      if (addMinutes(current, durationMinutes) > end) break
    }
  })

  return generatedSlots
})

/**
 * Updates the psychologist's availability (routine, exceptions and session settings).
 */
export const updatePsychologistAvailability = createSafeAction(
  updateAvailabilitySchema,
  async (params, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true },
    })

    if (!profile) {
      throw new Error('Perfil profissional não encontrado.')
    }

    const durationInt = parseInt(params.sessionDuration) || 50

    await prisma.$transaction(async (tx) => {
      await tx.psychologistProfile.update({
        where: { id: profile.id },
        data: {
          sessionDuration: durationInt,
          timezone: params.timezone,
          weeklySchedule: {
            ...params.weeklySchedule,
            sessionDuration: params.sessionDuration,
            breakDuration: params.breakDuration,
          },
        },
      })

      const newStateDates = Object.keys(params.overrides)

      await tx.scheduleOverride.deleteMany({
        where: {
          psychologistId: profile.id,
          date: { notIn: newStateDates },
        },
      })

      for (const date of newStateDates) {
        const override = params.overrides[date]
        await tx.scheduleOverride.upsert({
          where: {
            psychologistId_date: {
              psychologistId: profile.id,
              date: date,
            },
          },
          update: {
            type: override.type,
            slots: override.slots as any,
          },
          create: {
            psychologistId: profile.id,
            date: date,
            type: override.type,
            slots: override.slots as any,
          },
        })
      }
    })

    revalidatePath('/dashboard/agenda')
    revalidatePath(`/psicologo/${user.id}`)
    revalidatePath('/busca')
    revalidateTag('overrides')
    revalidateTag('psychologists')
    revalidateTag('appointments')

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
