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
        },
        conversation: {
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}))

import { getCurrentUserProfile } from '@/lib/actions/profile'
import { prisma } from '@/lib/prisma'
import { getConversations, getMessages, sendMessage, startOrGetConversation } from '@/lib/actions/messages'

const MOCK_PROFILE = { user_id: 'user-1', full_name: 'Test User' }

describe('messages actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getConversations', () => {
        it('should return empty array if user is not authenticated', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
            const result = await getConversations()
            expect(result).toEqual([])
        })

        it('should return formatted conversations for authenticated user', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);
            (prisma.conversationParticipant.findMany as jest.Mock).mockResolvedValue([
                {
                    conversation: {
                        id: 'conv-1',
                        messages: [{ content: 'Hello', createdAt: new Date() }],
                        participants: [
                            {
                                userId: 'other-user',
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
            expect(result[0].id).toBe('conv-1')
            expect(result[0].name).toBe('Dr. Smith')
            expect(result[0].otherParticipantId).toBe('other-user')
        })
    })

    describe('getMessages', () => {
        it('should return empty array if user is not authenticated', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
            const result = await getMessages('conv-1')
            expect(result).toEqual([])
        })

        it('should return formatted messages for a conversation', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE)
            const now = new Date();
            (prisma.message.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'msg-1',
                    content: 'Hello world',
                    senderId: 'user-1',
                    createdAt: now,
                    sender: {
                        name: 'Test User',
                        profiles: { fullName: 'Test User', avatarUrl: null },
                    },
                },
            ])

            const result = await getMessages('conv-1')

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('msg-1')
            expect(result[0].senderName).toBe('Test User')
            expect(prisma.message.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { conversationId: 'conv-1' },
                    orderBy: { createdAt: 'asc' },
                })
            )
        })
    })

    describe('sendMessage', () => {
        it('should return error if user is not authenticated', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
            const result = await sendMessage('conv-1', 'Hello')
            expect(result).toEqual({ success: false, error: 'Não autorizado' })
        })

        it('should create message and update conversation timestamp', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);
            (prisma.message.create as jest.Mock).mockResolvedValue({ id: 'msg-new' });
            (prisma.conversation.update as jest.Mock).mockResolvedValue({})

            const result = await sendMessage('conv-1', 'Nova mensagem')

            expect(result).toEqual({ success: true, messageId: 'msg-new' })
            expect(prisma.message.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    conversationId: 'conv-1',
                    senderId: MOCK_PROFILE.user_id,
                }),
            })
            expect(prisma.conversation.update).toHaveBeenCalledWith({
                where: { id: 'conv-1' },
                data: { lastMessageAt: expect.any(Date) },
            })
        })

        it('should return error on database failure', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);
            (prisma.message.create as jest.Mock).mockRejectedValue(new Error('DB error'))

            const result = await sendMessage('conv-1', 'Fail')
            expect(result).toEqual({ success: false, error: 'Erro ao enviar mensagem' })
        })
    })

    describe('startOrGetConversation', () => {
        it('should return null if user is not authenticated', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(null)
            const result = await startOrGetConversation('other-user')
            expect(result).toBeNull()
        })

        it('should return existing conversation id if already exists', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);
            (prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue({
                conversationId: 'existing-conv',
            })

            const result = await startOrGetConversation('other-user')

            expect(result).toBe('existing-conv')
            expect(prisma.conversation.create).not.toHaveBeenCalled()
        })

        it('should create new conversation if none exists', async () => {
            (getCurrentUserProfile as jest.Mock).mockResolvedValue(MOCK_PROFILE);
            (prisma.conversationParticipant.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.conversation.create as jest.Mock).mockResolvedValue({ id: 'new-conv' })

            const result = await startOrGetConversation('other-user')

            expect(result).toBe('new-conv')
            expect(prisma.conversation.create).toHaveBeenCalledWith({
                data: {
                    participants: {
                        create: [
                            { userId: MOCK_PROFILE.user_id },
                            { userId: 'other-user' },
                        ],
                    },
                },
            })
        })
    })
})
