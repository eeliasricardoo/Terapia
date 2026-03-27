'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { encryptData, decryptData, isValidUUID } from '@/lib/security'
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

export async function getDiaryEntries(): Promise<DiaryEntryData[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

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
  } catch (error) {
    logger.error('Error fetching diary entries:', error)
    return []
  }
}

export const saveDiaryEntry = createSafeAction(
  saveDiarySchema,
  async (data, user) => {
    // Garante que o usuário existe no Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        name: 'Paciente', // Default, would be updated by profile later
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

export async function getTodayMood() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const start = startOfDay(new Date())
    const end = endOfDay(new Date())

    const entry = await prisma.diaryEntry.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: start, lte: end },
      },
    })

    return entry
  } catch (error) {
    return null
  }
}

export async function saveQuickMood(mood: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autenticado' }

    const start = startOfDay(new Date())
    const end = endOfDay(new Date())

    const existing = await prisma.diaryEntry.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: start, lte: end },
      },
    })

    if (existing) {
      await prisma.diaryEntry.update({
        where: { id: existing.id },
        data: { mood },
      })
    } else {
      await prisma.diaryEntry.create({
        data: {
          userId: user.id,
          mood,
          content: encryptData('Sentimento registrado via Dashboard'),
          emotions: [],
        },
      })
    }

    return { success: true }
  } catch (error) {
    logger.error('Error saving quick mood:', error)
    return { success: false, error: 'Erro ao salvar humor' }
  }
}
