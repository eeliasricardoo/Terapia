/**
 * Tests for messages Server Actions
 */

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

jest.mock('@/lib/actions/profile', () => ({
  getCurrentUserProfile: jest.fn(),
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

import { getCurrentUserProfile } from '@/lib/actions/profile'
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

const MOCK_PROFILE = { user_id: USER_ID, full_name: 'Test User' }

describe('messages actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getConversations', () => {
    it('should return empty array if user is not authenticated', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
      const result = await getConversations()
      expect(result).toEqual([])
    })

    it('should return formatted conversations for authenticated user', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
      ;(prisma.conversationParticipant.findMany as jest.Mock).mockResolvedValue([
        {
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

      const result = await getConversations()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(CONV_ID)
      expect(result[0].name).toBe('Dr. Smith')
      expect(result[0].otherParticipantId).toBe(OTHER_USER_ID)
    })
  })

  describe('getMessages', () => {
    it('should return empty array if user is not authenticated', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
      const result = await getMessages(CONV_ID)
      expect(result).toEqual([])
    })

    it('should return empty array for invalid UUID', async () => {
      const result = await getMessages('invalid-id')
      expect(result).toEqual([])
    })

    it('should return formatted messages for a conversation', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
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

      const result = await getMessages(CONV_ID)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(MSG_ID)
      expect(result[0].senderName).toBe('Test User')
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: CONV_ID },
          orderBy: { createdAt: 'asc' },
        })
      )
    })
  })

  describe('sendMessage', () => {
    it('should return error for invalid conversation ID', async () => {
      const result = await sendMessage('invalid-id', 'Hello')
      expect(result).toEqual({ success: false, error: 'ID inválido' })
    })

    it('should return error if user is not authenticated', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
      const result = await sendMessage(CONV_ID, 'Hello')
      expect(result).toEqual({ success: false, error: 'Não autorizado' })
    })

    it('should create message and update conversation timestamp', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
      ;(prisma.message.create as jest.Mock).mockResolvedValue({ id: MSG_NEW_ID })
      ;(prisma.conversation.update as jest.Mock).mockResolvedValue({})

      const result = await sendMessage(CONV_ID, 'Nova mensagem')

      expect(result).toEqual({ success: true, messageId: MSG_NEW_ID })
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          conversationId: CONV_ID,
          senderId: MOCK_PROFILE.user_id,
        }),
      })
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: CONV_ID },
        data: { lastMessageAt: expect.any(Date) },
      })
    })

    it('should return error on database failure', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
      ;(prisma.message.create as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await sendMessage(CONV_ID, 'Fail')
      expect(result).toEqual({ success: false, error: 'Erro ao enviar mensagem' })
    })
  })

  describe('startOrGetConversation', () => {
    it('should return null for invalid UUID', async () => {
      const result = await startOrGetConversation('invalid-id')
      expect(result).toBeNull()
    })

    it('should return null if user is not authenticated', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
      const result = await startOrGetConversation(OTHER_USER_ID)
      expect(result).toBeNull()
    })

    it('should return existing conversation id if already exists', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
      ;(prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue({
        conversationId: EXISTING_CONV_ID,
      })

      const result = await startOrGetConversation(OTHER_USER_ID)

      expect(result).toBe(EXISTING_CONV_ID)
      expect(prisma.conversation.create).not.toHaveBeenCalled()
    })

    it('should create new conversation if none exists', async () => {
      ;(getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
      ;(prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue({ id: NEW_CONV_ID })

      const result = await startOrGetConversation(OTHER_USER_ID)

      expect(result).toBe(NEW_CONV_ID)
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          participants: {
            create: [{ userId: MOCK_PROFILE.user_id }, { userId: OTHER_USER_ID }],
          },
        },
      })
    })
  })
})
