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
        const dayMap: Record<string, string> = {
            lun: 'monday',
            mar: 'tuesday',
            mie: 'wednesday',
            jue: 'thursday',
            vie: 'friday',
            sab: 'saturday',
            dom: 'sunday'
        }

        const parseTimeTo24h = (time12: string) => {
            const [time, period] = time12.split(" ")
            const [hours, minutes] = time.split(":")
            let hour = parseInt(hours)
            if (period === "PM" && hour !== 12) hour += 12
            if (period === "AM" && hour === 12) hour = 0
            return `${hour.toString().padStart(2, "0")}:${minutes}`
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
        recurringSchedules.forEach(schedule => {
            const dayKey = dayMap[schedule.day]
            if (dayKey) {
                formattedWeeklySchedule[dayKey].enabled = true
                formattedWeeklySchedule[dayKey].slots.push({
                    start: parseTimeTo24h(schedule.startTime),
                    end: parseTimeTo24h(schedule.endTime)
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
        const mappedAvailable = specificDateSchedules.map(schedule => {
            const dateStr = new Date(schedule.date).toISOString().split('T')[0]
            return {
                psychologist_id: profileObj.id,
                date: dateStr,
                type: 'custom',
                slots: [{
                    start: parseTimeTo24h(schedule.startTime),
                    end: parseTimeTo24h(schedule.endTime)
                }],
            }
        })

        const mappedUnavailable = unavailableDates.map(date => {
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
    overrides: Record<string, { type: 'blocked' | 'custom', slots: TimeSlot[] }>
    appointments: { scheduled_at: string, duration_minutes: number }[]
}

export async function getPsychologistAvailability(psychologistId: string): Promise<PsychologistAvailability | null> {
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

    // 2. Os overrides para datas específicas
    const { data: overridesList, error: overridesError } = await supabase
        .from('schedule_overrides')
        .select('date, type, slots')
        .eq('psychologist_id', psychologistId)
        .gte('date', new Date().toISOString().split('T')[0]) // Somente overrides do presente/futuro

    const overridesMap: Record<string, { type: 'blocked' | 'custom', slots: TimeSlot[] }> = {}

    if (overridesList && !overridesError) {
        overridesList.forEach(o => {
            overridesMap[o.date] = {
                type: o.type as 'blocked' | 'custom',
                slots: (o.slots as unknown as TimeSlot[]) || []
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

    const appointmentsMap = appointmentList ? appointmentList.map(a => ({
        scheduled_at: a.scheduled_at,
        duration_minutes: a.duration_minutes
    })) : []

    return {
        timezone: profile.timezone || 'America/Sao_Paulo',
        weeklySchedule: (profile.weekly_schedule as unknown as WeeklyScheduleData) || null,
        overrides: overridesMap,
        appointments: appointmentsMap
    }
}
