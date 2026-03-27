import { z } from 'zod'

export const TimeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
})

export type TimeSlot = z.infer<typeof TimeSlotSchema>

export const DayScheduleSchema = z.object({
  enabled: z.boolean(),
  slots: z.array(TimeSlotSchema),
})

export type DaySchedule = z.infer<typeof DayScheduleSchema>

export const WeeklyScheduleSchema = z.object({
  sessionDuration: z.string(),
  breakDuration: z.string().optional(),
  monday: DayScheduleSchema,
  tuesday: DayScheduleSchema,
  wednesday: DayScheduleSchema,
  thursday: DayScheduleSchema,
  friday: DayScheduleSchema,
  saturday: DayScheduleSchema,
  sunday: DayScheduleSchema,
})

export type WeeklyScheduleData = z.infer<typeof WeeklyScheduleSchema>

export type PsychologistAvailability = {
  timezone: string
  weeklySchedule: WeeklyScheduleData | null
  overrides: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }>
  appointments: { id: string; scheduled_at: string; duration_minutes: number }[]
}
