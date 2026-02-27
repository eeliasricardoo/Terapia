"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/utils/logger"


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
                content: e.content,
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

        const entry = await prisma.diaryEntry.create({
            data: {
                userId: user.id,
                mood: data.mood,
                emotions: data.emotions,
                content: data.content,
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
