import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { encryptData, decryptData } from '@/lib/security'
import { startOfDay, endOfDay } from 'date-fns'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type DiaryEntryData = {
  id: string
  mood: number
  emotions: string[]
  content: string
  createdAt: string
  dateLabel: string
  dayOfWeek: string
}

const saveDiarySchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotions: z.array(z.string()),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

const deleteDiarySchema = z.object({
  id: z.string().uuid(),
})

const quickMoodSchema = z.object({
  mood: z.number().int().min(1).max(5),
})

/**
 * Fetches diary entries for the current user.
 */
export const getDiaryEntries = createSafeAction(z.void(), async (_, user) => {
  const entries = await prisma.diaryEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return entries.map((e) => {
    const date = new Date(e.createdAt)
    return {
      id: e.id,
      mood: e.mood,
      emotions: e.emotions,
      content: decryptData(e.content),
      createdAt: e.createdAt.toISOString(),
      dateLabel: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date),
      dayOfWeek: new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date),
    }
  })
})

/**
 * Saves or updates a full diary entry.
 */
export const saveDiaryEntry = createSafeAction(
  saveDiarySchema,
  async (data, user) => {
    // Upsert user reference if needed
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        name: 'Paciente',
        role: 'PATIENT',
      },
    })

    const entry = await prisma.diaryEntry.create({
      data: {
        userId: user.id,
        mood: data.mood,
        emotions: data.emotions,
        content: encryptData(data.content),
      },
    })

    return { id: entry.id }
  },
  { requiredRole: 'PATIENT' }
)

/**
 * Deletes a diary entry.
 */
export const deleteDiaryEntry = createSafeAction(
  deleteDiarySchema,
  async (data, user) => {
    await prisma.diaryEntry.delete({
      where: { id: data.id, userId: user.id },
    })
    return { success: true }
  },
  { requiredRole: 'PATIENT' }
)

/**
 * Gets the mood entry for today, if it exists.
 */
export const getTodayMood = createSafeAction(z.void(), async (_, user) => {
  const start = startOfDay(new Date())
  const end = endOfDay(new Date())

  const entry = await prisma.diaryEntry.findFirst({
    where: {
      userId: user.id,
      createdAt: { gte: start, lte: end },
    },
  })

  return entry
})

/**
 * Rapidly records today's mood from the dashboard.
 */
export const saveQuickMood = createSafeAction(
  quickMoodSchema,
  async (data, user) => {
    const start = startOfDay(new Date())
    const end = endOfDay(new Date())

    const existing = await prisma.diaryEntry.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: start, lte: end },
      },
    })

    if (existing) {
      const updated = await prisma.diaryEntry.update({
        where: { id: existing.id },
        data: { mood: data.mood },
      })
      return { id: updated.id, updated: true }
    } else {
      const entry = await prisma.diaryEntry.create({
        data: {
          userId: user.id,
          mood: data.mood,
          content: encryptData('Sentimento registrado via Dashboard'),
          emotions: [],
        },
      })
      return { id: entry.id, updated: false }
    }
  },
  { requiredRole: 'PATIENT' }
)
