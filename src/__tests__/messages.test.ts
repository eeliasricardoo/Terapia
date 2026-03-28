/**
 * Tests for messages Server Actions
 */

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversationParticipant: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Set ENCRYPTION_KEY for tests
process.env.ENCRYPTION_KEY = 'test_encryption_key_32chars_ok!'

import { prisma } from '@/lib/prisma'
import {
  getConversations,
  getMessages,
  sendMessage,
  startOrGetConversation,
} from '@/lib/actions/messages'

// Valid UUIDs for testing
const USER_ID = '550e8400-e29b-41d4-a716-446655440000'
const OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001'
const CONV_ID = '770e8400-e29b-41d4-a716-446655440002'
const MSG_ID = '880e8400-e29b-41d4-a716-446655440003'
const MSG_NEW_ID = '990e8400-e29b-41d4-a716-446655440004'
const EXISTING_CONV_ID = 'aa0e8400-e29b-41d4-a716-446655440005'
const NEW_CONV_ID = 'bb0e8400-e29b-41d4-a716-446655440006'

const MOCK_USER = { id: USER_ID, email: 'test@test.com' }

describe('messages actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
  })

  describe('getConversations', () => {
    it('should return empty array if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await getConversations()
      expect(result.success).toBe(false)
    })

    it('should return formatted conversations for authenticated user', async () => {
      ;(prisma.conversationParticipant.findMany as jest.Mock).mockResolvedValue([
        {
          lastReadAt: null,
          conversation: {
            id: CONV_ID,
            messages: [{ content: 'Hello', createdAt: new Date() }],
            participants: [
              {
                userId: OTHER_USER_ID,
                user: {
                  name: 'Dr. Smith',
                  profiles: { fullName: 'Dr. Smith', avatarUrl: '/avatar.jpg' },
                },
              },
            ],
          },
        },
      ])
      // Mock the batch unread query added by the N+1 fix
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue([])

      const result = await getConversations()

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(CONV_ID)
      expect(result.data[0].name).toBe('Dr. Smith')
      expect(result.data[0].otherParticipantId).toBe(OTHER_USER_ID)
    })
  })

  describe('getMessages', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await getMessages({ conversationId: CONV_ID, limit: 100 })
      expect(result.success).toBe(false)
    })

    it('should return validation error for invalid UUID', async () => {
      const result = await getMessages({ conversationId: 'invalid-id', limit: 100 })
      expect(result.success).toBe(false)
    })

    it('should return formatted messages for a conversation', async () => {
      const now = new Date()
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue([
        {
          id: MSG_ID,
          content: 'Hello world',
          senderId: USER_ID,
          createdAt: now,
          sender: {
            name: 'Test User',
            profiles: { fullName: 'Test User', avatarUrl: null },
          },
        },
      ])

      const result = await getMessages({ conversationId: CONV_ID, limit: 100 })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(MSG_ID)
      expect(result.data[0].senderName).toBe('Test User')
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: CONV_ID },
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('sendMessage', () => {
    it('should return error for invalid conversation ID', async () => {
      const result = await sendMessage({ conversationId: 'invalid-id', content: 'Hello' })
      expect(result.success).toBe(false)
    })

    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await sendMessage({ conversationId: CONV_ID, content: 'Hello' })
      expect(result.success).toBe(false)
    })

    it('should create message and update conversation timestamp', async () => {
      ;(prisma.message.create as jest.Mock).mockResolvedValue({ id: MSG_NEW_ID })
      ;(prisma.conversation.update as jest.Mock).mockResolvedValue({})

      const result = await sendMessage({ conversationId: CONV_ID, content: 'Nova mensagem' })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.id).toBe(MSG_NEW_ID)
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          conversationId: CONV_ID,
          senderId: USER_ID,
        }),
      })
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: CONV_ID },
        data: { lastMessageAt: expect.any(Date) },
      })
    })

    it('should return error on database failure', async () => {
      ;(prisma.message.create as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await sendMessage({ conversationId: CONV_ID, content: 'Fail' })
      expect(result.success).toBe(false)
    })
  })

  describe('startOrGetConversation', () => {
    it('should return error for invalid UUID', async () => {
      const result = await startOrGetConversation({ otherUserId: 'invalid-id' })
      expect(result.success).toBe(false)
    })

    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await startOrGetConversation({ otherUserId: OTHER_USER_ID })
      expect(result.success).toBe(false)
    })

    it('should return existing conversation id if already exists', async () => {
      ;(prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue({
        conversationId: EXISTING_CONV_ID,
      })

      const result = await startOrGetConversation({ otherUserId: OTHER_USER_ID })

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBe(EXISTING_CONV_ID)
      expect(prisma.conversation.create).not.toHaveBeenCalled()
    })

    it('should create new conversation if none exists', async () => {
      ;(prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue({ id: NEW_CONV_ID })

      const result = await startOrGetConversation({ otherUserId: OTHER_USER_ID })

      expect(result.success).toBe(true)
      expect(result.success && result.data).toBe(NEW_CONV_ID)
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          participants: {
            create: [{ userId: USER_ID }, { userId: OTHER_USER_ID }],
          },
        },
      })
    })
  })
})
