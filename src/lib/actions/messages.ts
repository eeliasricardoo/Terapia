import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { encryptData, decryptData } from '@/lib/security'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type MessageData = {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string | null
  createdAt: string
}

export type ConversationData = {
  id: string
  name: string
  avatar?: string | null
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  otherParticipantId: string
}

const getMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().optional().default(100),
})

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

const startConversationSchema = z.object({
  otherUserId: z.string().uuid(),
})

/**
 * Fetches all conversations for the current user.
 */
export const getConversations = createSafeAction(z.void(), async (_, user) => {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          participants: {
            where: { userId: { not: user.id } },
            include: {
              user: {
                include: { profiles: true },
              },
            },
          },
        },
      },
    },
  })

  const conversationIds = participants.map((p) => p.conversation.id)

  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: user.id },
    },
    select: { conversationId: true, createdAt: true },
  })

  const lastReadAtMap = new Map(participants.map((p) => [p.conversation.id, p.lastReadAt]))
  const unreadCountMap = new Map<string, number>()
  for (const msg of unreadMessages) {
    const lastReadAt = lastReadAtMap.get(msg.conversationId)
    if (!lastReadAt || msg.createdAt > lastReadAt) {
      unreadCountMap.set(msg.conversationId, (unreadCountMap.get(msg.conversationId) ?? 0) + 1)
    }
  }

  const conversationsWithData = participants.map((p) => {
    const conv = p.conversation
    const otherParticipant = conv.participants[0]
    const lastMsg = conv.messages[0]

    return {
      id: conv.id,
      name: otherParticipant?.user.profiles?.fullName || otherParticipant?.user.name || 'Usuário',
      avatar: otherParticipant?.user.profiles?.avatarUrl,
      lastMessage: decryptData(lastMsg?.content || ''),
      lastMessageAt: lastMsg?.createdAt.toISOString(),
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
      otherParticipantId: otherParticipant?.userId,
    } as ConversationData
  })

  return conversationsWithData.sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return timeB - timeA
  })
})

/**
 * Fetches messages for a specific conversation.
 */
export const getMessages = createSafeAction(getMessagesSchema, async (data, user) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: data.conversationId },
    orderBy: { createdAt: 'desc' },
    take: data.limit,
    include: {
      sender: {
        include: { profiles: true },
      },
    },
  })

  return messages.reverse().map((m) => ({
    id: m.id,
    content: decryptData(m.content),
    senderId: m.senderId,
    senderName: m.sender.profiles?.fullName || m.sender.name || 'Usuário',
    senderAvatar: m.sender.profiles?.avatarUrl,
    createdAt: m.createdAt.toISOString(),
  })) as MessageData[]
})

/**
 * Sends a new message in a conversation.
 */
export const sendMessage = createSafeAction(sendMessageSchema, async (data, user) => {
  const encryptedContent = encryptData(data.content)
  const message = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: user.id,
      content: encryptedContent,
    },
  })

  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: { lastMessageAt: new Date() },
  })

  // Trigger Pusher event for Real-time
  try {
    const { pusherServer } = await import('@/lib/pusher')
    if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      await pusherServer.trigger(`conversation-${data.conversationId}`, 'new-message', {
        id: message.id,
        content: data.content,
        senderId: user.id,
        createdAt: message.createdAt,
      })
    }
  } catch (pusherError) {
    logger.error('Failed to trigger Pusher event:', pusherError)
  }

  revalidatePath('/dashboard/mensagens')
  return { id: message.id }
})

/**
 * Starts a new conversation or returns an existing one.
 */
export const startOrGetConversation = createSafeAction(
  startConversationSchema,
  async (data, user) => {
    const existingParticipation = await prisma.conversationParticipant.findFirst({
      where: {
        userId: user.id,
        conversation: {
          participants: {
            some: { userId: data.otherUserId },
          },
        },
      },
    })

    if (existingParticipation) {
      return existingParticipation.conversationId
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.id }, { userId: data.otherUserId }],
        },
      },
    })

    revalidatePath('/dashboard/mensagens')
    return conversation.id
  }
)
