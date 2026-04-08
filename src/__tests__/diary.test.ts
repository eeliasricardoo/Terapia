/**
 * Tests for diary Server Actions
 */

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

// Mock dependencies BEFORE imports
jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

const mockPrismaDiaryFindMany = jest.fn()
const mockPrismaDiaryCreate = jest.fn()
const mockPrismaDiaryDelete = jest.fn()
const mockPrismaDiaryFindFirst = jest.fn()
const mockPrismaDiaryUpdate = jest.fn()
const mockPrismaUserUpsert = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    diaryEntry: {
      findMany: (...args: unknown[]) => mockPrismaDiaryFindMany(...args),
      create: (...args: unknown[]) => mockPrismaDiaryCreate(...args),
      delete: (...args: unknown[]) => mockPrismaDiaryDelete(...args),
      findFirst: (...args: unknown[]) => mockPrismaDiaryFindFirst(...args),
      update: (...args: unknown[]) => mockPrismaDiaryUpdate(...args),
    },
    user: {
      upsert: (...args: unknown[]) => mockPrismaUserUpsert(...args),
    },
  },
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

import {
  getDiaryEntries,
  saveDiaryEntry,
  deleteDiaryEntry,
  getTodayMood,
  saveQuickMood,
} from '@/lib/actions/diary'

const MOCK_USER = {
  id: VALID_UUID,
  email: 'test@test.com',
  app_metadata: { role: 'PATIENT' },
}

describe('diary actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
  })

  describe('getDiaryEntries', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await getDiaryEntries()
      expect(result.success).toBe(false)
    })

    it('should return formatted diary entries for authenticated user', async () => {
      const now = new Date('2026-03-04T10:00:00Z')
      mockPrismaDiaryFindMany.mockResolvedValue([
        {
          id: VALID_UUID,
          mood: 4,
          emotions: ['feliz', 'grato'],
          content: 'encrypted-Um ótimo dia',
          createdAt: now,
        },
      ])

      const result = await getDiaryEntries()

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(VALID_UUID)
      expect(result.data[0].mood).toBe(4)
      expect(result.data[0].content).toBe('Um ótimo dia')
    })
  })

  describe('saveDiaryEntry', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await saveDiaryEntry({ mood: 3, emotions: [], content: 'test' })
      expect(result.success).toBe(false)
      if (result.success) return
      expect(result.code).toBe('UNAUTHENTICATED')
    })

    it('should create diary entry for authenticated user', async () => {
      mockPrismaUserUpsert.mockResolvedValue({})
      mockPrismaDiaryCreate.mockResolvedValue({ id: VALID_UUID })

      const result = await saveDiaryEntry({ mood: 4, emotions: ['feliz'], content: 'Bom dia' })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.id).toBe(VALID_UUID)
    })
  })

  describe('deleteDiaryEntry', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await deleteDiaryEntry({ id: VALID_UUID })
      expect(result.success).toBe(false)
      if (result.success) return
      expect(result.code).toBe('UNAUTHENTICATED')
    })

    it('should delete entry owned by user', async () => {
      mockPrismaDiaryDelete.mockResolvedValue({})

      const result = await deleteDiaryEntry({ id: VALID_UUID })
      expect(result.success).toBe(true)
      expect(mockPrismaDiaryDelete).toHaveBeenCalledWith({
        where: { id: VALID_UUID, userId: VALID_UUID },
      })
    })
  })

  describe('getTodayMood', () => {
    it('should return today mood entry', async () => {
      const entry = { id: VALID_UUID, mood: 5 }
      mockPrismaDiaryFindFirst.mockResolvedValue(entry)

      const result = await getTodayMood()
      expect(result.success).toBe(true)
      expect(result.success && result.data).toEqual(entry)
    })
  })

  describe('saveQuickMood', () => {
    it('should update existing entry if mood already saved today', async () => {
      mockPrismaDiaryFindFirst.mockResolvedValue({ id: 'existing-entry' })
      mockPrismaDiaryUpdate.mockResolvedValue({ id: 'existing-entry' })

      const result = await saveQuickMood({ mood: 3 })

      expect(result.success).toBe(true)
      expect(mockPrismaDiaryUpdate).toHaveBeenCalledWith({
        where: { id: 'existing-entry' },
        data: { mood: 3 },
      })
    })
  })
})
