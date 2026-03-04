"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/utils/logger"
import { encryptData, decryptData } from "@/lib/security"
import { startOfDay, endOfDay } from "date-fns"


export type DiaryEntryData = {
    id: string
    mood: number
    emotions: string[]
    content: string
    createdAt: string
    dateLabel: string
    dayOfWeek: string
}

export async function getDiaryEntries(): Promise<DiaryEntryData[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const entries = await prisma.diaryEntry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        return entries.map(e => {
            const date = new Date(e.createdAt)
            return {
                id: e.id,
                mood: e.mood,
                emotions: e.emotions,
                content: decryptData(e.content),
                createdAt: e.createdAt.toISOString(),
                dateLabel: new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }).format(date),
                dayOfWeek: new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date),
            }
        })
    } catch (error) {
        logger.error('Error fetching diary entries:', error)
        return []
    }
}

export async function saveDiaryEntry(data: {
    mood: number
    emotions: string[]
    content: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Não autenticado' }

        // Garante que o usuário existe no Prisma antes de criar a entrada (Ex: pacientes antigos sem registro na tabela users)
        await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.email || '' },
            create: {
                id: user.id,
                email: user.email || '',
                name: (user.user_metadata?.full_name as string) || 'Paciente',
                role: (user.user_metadata?.role as any) || 'PATIENT',
            }
        })

        const entry = await prisma.diaryEntry.create({
            data: {
                userId: user.id,
                mood: data.mood,
                emotions: data.emotions,
                content: encryptData(data.content),
            }
        })

        return { success: true, id: entry.id }
    } catch (error) {
        logger.error('Error saving diary entry:', error)
        return { success: false, error: 'Erro ao salvar entrada' }
    }
}

export async function deleteDiaryEntry(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Não autenticado' }

        await prisma.diaryEntry.delete({
            where: { id, userId: user.id }
        })

        return { success: true }
    } catch (error) {
        logger.error('Error deleting diary entry:', error)
        return { success: false, error: 'Erro ao deletar entrada' }
    }
}

export async function getTodayMood() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const start = startOfDay(new Date())
        const end = endOfDay(new Date())

        const entry = await prisma.diaryEntry.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: start, lte: end }
            }
        })

        return entry
    } catch (error) {
        return null
    }
}

export async function saveQuickMood(mood: number) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Não autenticado' }

        const start = startOfDay(new Date())
        const end = endOfDay(new Date())

        const existing = await prisma.diaryEntry.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: start, lte: end }
            }
        })

        if (existing) {
            await prisma.diaryEntry.update({
                where: { id: existing.id },
                data: { mood }
            })
        } else {
            await prisma.diaryEntry.create({
                data: {
                    userId: user.id,
                    mood,
                    content: encryptData('Sentimento registrado via Dashboard'),
                    emotions: []
                }
            })
        }

        return { success: true }
    } catch (error) {
        logger.error('Error saving quick mood:', error)
        return { success: false, error: 'Erro ao salvar humor' }
    }
}
