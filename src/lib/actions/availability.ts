'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ScheduleItem = {
  id: string
  day: string
  startTime: string
  endTime: string
}

export type SpecificDateSchedule = {
  id: string
  date: Date | string
  startTime: string
  endTime: string
}

export async function saveAvailability(
  sessionDuration: string,
  recurringSchedules: ScheduleItem[],
  specificDateSchedules: SpecificDateSchedule[],
  unavailableDays: string[],
  unavailableDates: Date[] | string[]
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    // 1. Get the psychologist profile ID based on userId
    const { data: profileObj, error: fetchErr } = await supabase
      .from('psychologist_profiles')
      .select('id')
      .eq('userId', user.id)
      .single()

    if (fetchErr || !profileObj) {
      console.error('Error fetching psychologist profile:', fetchErr)
      return { success: false, error: 'Perfil de psicólogo não encontrado' }
    }

    // Convert the "lun", "mar"... format to the ones used by ScheduleManager
    // Convert supported abbreviations to DB format
    const dayMap: Record<string, string> = {
      // Spanish (legacy)
      lun: 'monday',
      mar: 'tuesday',
      mie: 'wednesday',
      jue: 'thursday',
      vie: 'friday',
      sab: 'saturday',
      dom: 'sunday',
      // Portuguese (new)
      seg: 'monday',
      ter: 'tuesday',
      qua: 'wednesday',
      qui: 'thursday',
      sex: 'friday',
      // sab and dom are the same in both
    }

    const parseTimeTo24h = (time12: string) => {
      const [time, period] = time12.split(' ')
      const [hours, minutes] = time.split(':')
      let hour = parseInt(hours)
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      return `${hour.toString().padStart(2, '0')}:${minutes}`
    }

    const formattedWeeklySchedule: any = {
      sessionDuration,
      monday: { enabled: false, slots: [] },
      tuesday: { enabled: false, slots: [] },
      wednesday: { enabled: false, slots: [] },
      thursday: { enabled: false, slots: [] },
      friday: { enabled: false, slots: [] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    }

    // Apply schedules
    recurringSchedules.forEach((schedule) => {
      const dayKey = dayMap[schedule.day]
      if (dayKey) {
        formattedWeeklySchedule[dayKey].enabled = true
        formattedWeeklySchedule[dayKey].slots.push({
          start: parseTimeTo24h(schedule.startTime),
          end: parseTimeTo24h(schedule.endTime),
        })
      }
    })

    const { error: profileError } = await supabase
      .from('psychologist_profiles')
      .update({
        weekly_schedule: formattedWeeklySchedule,
        updated_at: new Date().toISOString(),
      })
      .eq('userId', user.id)

    if (profileError) {
      console.error('Error updating psychologist profile schedule:', profileError)
      return { success: false, error: 'Erro ao salvar horários regulares' }
    }

    // 3. Clear existing future overrides to insert the new ones clean
    const todayStr = new Date().toISOString().split('T')[0]
    const { error: deleteErr } = await supabase
      .from('schedule_overrides')
      .delete()
      .eq('psychologist_id', profileObj.id)
      .gte('date', todayStr)

    if (deleteErr) {
      console.error('Error deleting old overrides:', deleteErr)
      // Não vamos falhar, pode ser que seja apenas na dev ou algo menor
    }

    // 4. Insert new specific dates
    const mappedAvailable = specificDateSchedules.map((schedule) => {
      const dateStr = new Date(schedule.date).toISOString().split('T')[0]
      return {
        psychologist_id: profileObj.id,
        date: dateStr,
        type: 'custom',
        slots: [
          {
            start: parseTimeTo24h(schedule.startTime),
            end: parseTimeTo24h(schedule.endTime),
          },
        ],
      }
    })

    const mappedUnavailable = unavailableDates.map((date) => {
      const dateStr = new Date(date).toISOString().split('T')[0]
      return {
        psychologist_id: profileObj.id,
        date: dateStr,
        type: 'blocked',
        slots: [],
      }
    })

    const allOverrides = [...mappedAvailable, ...mappedUnavailable]

    if (allOverrides.length > 0) {
      const { error: overrideError } = await supabase
        .from('schedule_overrides')
        .insert(allOverrides)

      if (overrideError) {
        console.error('Error inserting schedule overrides:', overrideError)
        return { success: false, error: 'Erro ao salvar datas específicas' }
      }
    }

    // Revalidate the pages that might display this
    revalidatePath('/dashboard')
    revalidatePath('/psicologo/[id]', 'page')
    revalidatePath('/busca')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Erro interno no servidor' }
  }
}

export type TimeSlot = {
  start: string
  end: string
}

export type DaySchedule = {
  enabled: boolean
  slots: TimeSlot[]
}

export type WeeklyScheduleData = {
  sessionDuration: string
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export type PsychologistAvailability = {
  timezone: string
  weeklySchedule: WeeklyScheduleData | null
  overrides: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }>
  appointments: { scheduled_at: string; duration_minutes: number }[]
}

export async function getPsychologistAvailability(
  psychologistId: string
): Promise<PsychologistAvailability | null> {
  const supabase = await createClient()

  // 1. O perfil do psicólogo que contém o weekly_schedule e timezone
  const { data: profile, error: profileError } = await supabase
    .from('psychologist_profiles')
    .select('weekly_schedule, timezone')
    .eq('id', psychologistId)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching psychologist availability:', profileError)
    return null
  }

  // Pegamos overrides de alguns dias atrás até o futuro para evitar perder datas por questões de fuso horário do servidor (UTC x Local)
  const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: overridesList, error: overridesError } = await supabase
    .from('schedule_overrides')
    .select('date, type, slots')
    .eq('psychologist_id', psychologistId)
    .gte('date', recentPastDate)

  const overridesMap: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}

  if (overridesList && !overridesError) {
    overridesList.forEach((o) => {
      overridesMap[o.date] = {
        type: o.type as 'blocked' | 'custom',
        slots: (o.slots as unknown as TimeSlot[]) || [],
      }
    })
  }

  // 3. Os agendamentos futuros para evitar conflitos
  const { data: appointmentList, error: apptError } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('psychologist_id', psychologistId)
    .gte('scheduled_at', new Date().toISOString())
    .neq('status', 'cancelled')

  const appointmentsMap = appointmentList
    ? appointmentList.map((a) => ({
        scheduled_at: a.scheduled_at,
        duration_minutes: a.duration_minutes,
      }))
    : []

  return {
    timezone: profile.timezone || 'America/Sao_Paulo',
    weeklySchedule: (profile.weekly_schedule as unknown as WeeklyScheduleData) || null,
    overrides: overridesMap,
    appointments: appointmentsMap,
  }
}

import { format, isBefore, startOfDay, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function getAvailableTimeSlots(
  psychologistId: string,
  dateStr: string // YYYY-MM-DD
): Promise<string[]> {
  const availability = await getPsychologistAvailability(psychologistId)
  if (!availability) return []

  const date = new Date(dateStr)
  const timezone = availability.timezone || 'America/Sao_Paulo'
  const today = toZonedTime(new Date(), timezone)

  // 1. Is Day Available
  if (isBefore(date, startOfDay(today))) return []

  let isAvailable = false
  if (availability.overrides[dateStr]) {
    isAvailable =
      availability.overrides[dateStr].type === 'custom' &&
      availability.overrides[dateStr].slots.length > 0
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

  // 2. Generate Slots
  let slotsDef: TimeSlot[] = []
  if (availability.overrides[dateStr] && availability.overrides[dateStr].type === 'custom') {
    slotsDef = availability.overrides[dateStr].slots
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
}
