/**
 * Tests for diary Server Actions
 */

// Mock dependencies BEFORE imports — use inline objects for jest.mock factories (hoisting-safe)
jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: { getUser: jest.fn() },
    })),
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        diaryEntry: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        user: {
            upsert: jest.fn(),
        },
    },
}))

jest.mock('@/lib/utils/logger', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
    getDiaryEntries,
    saveDiaryEntry,
    deleteDiaryEntry,
    getTodayMood,
    saveQuickMood,
} from '@/lib/actions/diary'

const MOCK_USER = { id: 'user-1', email: 'test@test.com', user_metadata: { full_name: 'Test User', role: 'PATIENT' } }

function mockAuth(user: any) {
    (createClient as jest.Mock).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    })
}

describe('diary actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getDiaryEntries', () => {
        it('should return empty array if user is not authenticated', async () => {
            mockAuth(null)
            const result = await getDiaryEntries()
            expect(result).toEqual([])
        })

        it('should return formatted diary entries for authenticated user', async () => {
            mockAuth(MOCK_USER)
            const now = new Date('2026-03-04T10:00:00Z');
            (prisma.diaryEntry.findMany as jest.Mock).mockResolvedValue([
                { id: 'entry-1', mood: 4, emotions: ['feliz', 'grato'], content: 'Um ótimo dia', createdAt: now },
            ])

            const result = await getDiaryEntries()

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('entry-1')
            expect(result[0].mood).toBe(4)
            expect(result[0].emotions).toEqual(['feliz', 'grato'])
            expect(prisma.diaryEntry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { userId: MOCK_USER.id }, orderBy: { createdAt: 'desc' }, take: 50 })
            )
        })

        it('should return empty array on error', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))
            const result = await getDiaryEntries()
            expect(result).toEqual([])
        })
    })

    describe('saveDiaryEntry', () => {
        it('should return error if user is not authenticated', async () => {
            mockAuth(null)
            const result = await saveDiaryEntry({ mood: 3, emotions: [], content: 'test' })
            expect(result).toEqual({ success: false, error: 'Não autenticado' })
        })

        it('should create diary entry for authenticated user', async () => {
            mockAuth(MOCK_USER);
            (prisma.user.upsert as jest.Mock).mockResolvedValue({});
            (prisma.diaryEntry.create as jest.Mock).mockResolvedValue({ id: 'new-entry-1' })

            const result = await saveDiaryEntry({ mood: 4, emotions: ['feliz'], content: 'Bom dia' })

            expect(result).toEqual({ success: true, id: 'new-entry-1' })
            expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { id: MOCK_USER.id } }))
            expect(prisma.diaryEntry.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ userId: MOCK_USER.id, mood: 4, emotions: ['feliz'] }),
                })
            )
        })

        it('should return error on database failure', async () => {
            mockAuth(MOCK_USER);
            (prisma.user.upsert as jest.Mock).mockResolvedValue({});
            (prisma.diaryEntry.create as jest.Mock).mockRejectedValue(new Error('DB error'))

            const result = await saveDiaryEntry({ mood: 3, emotions: [], content: 'test' })
            expect(result).toEqual({ success: false, error: 'Erro ao salvar entrada' })
        })
    })

    describe('deleteDiaryEntry', () => {
        it('should return error if user is not authenticated', async () => {
            mockAuth(null)
            const result = await deleteDiaryEntry('entry-1')
            expect(result).toEqual({ success: false, error: 'Não autenticado' })
        })

        it('should delete entry owned by user', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.delete as jest.Mock).mockResolvedValue({})

            const result = await deleteDiaryEntry('entry-1')
            expect(result).toEqual({ success: true })
            expect(prisma.diaryEntry.delete).toHaveBeenCalledWith({ where: { id: 'entry-1', userId: MOCK_USER.id } })
        })

        it('should return error on delete failure', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.delete as jest.Mock).mockRejectedValue(new Error('Not found'))

            const result = await deleteDiaryEntry('entry-999')
            expect(result).toEqual({ success: false, error: 'Erro ao deletar entrada' })
        })
    })

    describe('getTodayMood', () => {
        it('should return null if user is not authenticated', async () => {
            mockAuth(null)
            const result = await getTodayMood()
            expect(result).toBeNull()
        })

        it('should return today mood entry', async () => {
            mockAuth(MOCK_USER)
            const entry = { id: 'entry-today', mood: 5 };
            (prisma.diaryEntry.findFirst as jest.Mock).mockResolvedValue(entry)

            const result = await getTodayMood()
            expect(result).toEqual(entry)
        })

        it('should return null on error', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'))
            const result = await getTodayMood()
            expect(result).toBeNull()
        })
    })

    describe('saveQuickMood', () => {
        it('should return error if user is not authenticated', async () => {
            mockAuth(null)
            const result = await saveQuickMood(4)
            expect(result).toEqual({ success: false, error: 'Não autenticado' })
        })

        it('should update existing entry if mood already saved today', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-entry' });
            (prisma.diaryEntry.update as jest.Mock).mockResolvedValue({})

            const result = await saveQuickMood(3)

            expect(result).toEqual({ success: true })
            expect(prisma.diaryEntry.update).toHaveBeenCalledWith({ where: { id: 'existing-entry' }, data: { mood: 3 } })
            expect(prisma.diaryEntry.create).not.toHaveBeenCalled()
        })

        it('should create new entry if no mood today', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.diaryEntry.create as jest.Mock).mockResolvedValue({})

            const result = await saveQuickMood(5)

            expect(result).toEqual({ success: true })
            expect(prisma.diaryEntry.create).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ userId: MOCK_USER.id, mood: 5, emotions: [] }) })
            )
        })

        it('should return error on failure', async () => {
            mockAuth(MOCK_USER);
            (prisma.diaryEntry.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'))
            const result = await saveQuickMood(3)
            expect(result).toEqual({ success: false, error: 'Erro ao salvar humor' })
        })
    })
})
