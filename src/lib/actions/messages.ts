'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserProfile } from './profile'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'
import { encryptData, decryptData, isValidUUID } from '@/lib/security'
import {
  Conversation,
  Message,
  ConversationParticipant,
  User,
  Profile as PrismaProfile,
} from '@prisma/client'

export type MessageData = {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string | null
  createdAt: Date
}

export type ConversationData = {
  id: string
  name: string
  avatar?: string | null
  lastMessage?: string
  lastMessageAt?: Date
  unreadCount: number
  otherParticipantId: string
}

export async function getConversations() {
  const profile = await getCurrentUserProfile()
  if (!profile) return []

  const userId = profile.user_id

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          participants: {
            where: { userId: { not: userId } },
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

  const conversationsWithData = await Promise.all(
    participants.map(async (p) => {
      const conv = p.conversation
      const otherParticipant = conv.participants[0]
      const lastMsg = conv.messages[0]

      let unreadCount = 0
      if (p.lastReadAt) {
        unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: { gt: p.lastReadAt },
          },
        })
      } else {
        unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
          },
        })
      }

      return {
        id: conv.id,
        name: otherParticipant?.user.profiles?.fullName || otherParticipant?.user.name || 'Usuário',
        avatar: otherParticipant?.user.profiles?.avatarUrl,
        lastMessage: decryptData(lastMsg?.content || ''),
        lastMessageAt: lastMsg?.createdAt,
        unreadCount,
        otherParticipantId: otherParticipant?.userId,
      } as ConversationData
    })
  )

  return conversationsWithData.sort((a: ConversationData, b: ConversationData) => {
    const timeA = a.lastMessageAt?.getTime() || 0
    const timeB = b.lastMessageAt?.getTime() || 0
    return timeB - timeA
  })
}

export async function getMessages(conversationId: string, limit: number = 100) {
  if (!isValidUUID(conversationId)) return []

  const profile = await getCurrentUserProfile()
  if (!profile) return []

  // Load last N messages (most recent first, then reverse for chronological display)
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sender: {
        include: { profiles: true },
      },
    },
  })

  // Reverse to show oldest first (chronological order)
  return messages.reverse().map((m) => ({
    id: m.id,
    content: decryptData(m.content),
    senderId: m.senderId,
    senderName: m.sender.profiles?.fullName || m.sender.name || 'Usuário',
    senderAvatar: m.sender.profiles?.avatarUrl,
    createdAt: m.createdAt,
  })) as MessageData[]
}

export async function sendMessage(conversationId: string, content: string) {
  if (!isValidUUID(conversationId)) return { success: false, error: 'ID inválido' }

  const profile = await getCurrentUserProfile()
  if (!profile) return { success: false, error: 'Não autorizado' }

  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: profile.user_id,
        content: encryptData(content),
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    revalidatePath('/dashboard/mensagens')
    return { success: true, messageId: message.id }
  } catch (error) {
    logger.error('Error sending message:', error)
    return { success: false, error: 'Erro ao enviar mensagem' }
  }
}

export async function startOrGetConversation(otherUserId: string) {
  if (!isValidUUID(otherUserId)) return null

  const profile = await getCurrentUserProfile()
  if (!profile) return null

  const myUserId = profile.user_id

  // Check if conversation already exists between these two
  const existingParticipation = await prisma.conversationParticipant.findFirst({
    where: {
      userId: myUserId,
      conversation: {
        participants: {
          some: { userId: otherUserId },
        },
      },
    },
  })

  if (existingParticipation) {
    return existingParticipation.conversationId
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: myUserId }, { userId: otherUserId }],
      },
    },
  })

  revalidatePath('/dashboard/mensagens')
  return conversation.id
}
