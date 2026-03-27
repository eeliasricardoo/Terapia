'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getConversations,
  getMessages,
  sendMessage,
  type ConversationData,
  type MessageData,
} from '@/lib/actions/messages'

export function useChat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialId = searchParams.get('id')

  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [messages, setMessages] = useState<MessageData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialId)
  const [isLoadingConvs, setIsLoadingConvs] = useState(true)
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    const loadInitial = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setMyUserId(user.id)

      const convsRes = await getConversations()
      setConversations(convsRes.success ? convsRes.data : [])
      setIsLoadingConvs(false)

      if (initialId && !selectedId) {
        setSelectedId(initialId)
      }
    }
    loadInitial()
  }, [supabase, initialId, selectedId])

  const loadMessages = useCallback(
    async (id: string) => {
      setIsLoadingMsgs(true)
      const msgsRes = await getMessages(id)
      setMessages(msgsRes.success ? msgsRes.data : [])
      setIsLoadingMsgs(false)
      setTimeout(() => scrollToBottom('auto'), 100)
    },
    [scrollToBottom]
  )

  // Refreshes messages without showing the loading spinner — used by realtime updates.
  const refreshMessages = useCallback(
    async (id: string) => {
      const msgsRes = await getMessages(id)
      setMessages(msgsRes.success ? msgsRes.data : [])
      setTimeout(() => scrollToBottom('smooth'), 50)
    },
    [scrollToBottom]
  )

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId)

      const channel = supabase
        .channel(`chat-${selectedId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedId}`,
          },
          () => {
            // Fetch from server to get decrypted content and resolved sender names,
            // rather than displaying the raw (encrypted) payload from the realtime event.
            refreshMessages(selectedId)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedId, loadMessages, refreshMessages, supabase, scrollToBottom])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId || isSending) return

    setIsSending(true)
    const result = await sendMessage(selectedId, newMessage.trim())
    if (result.success) {
      setNewMessage('')
      // The realtime INSERT event will trigger refreshMessages, so no explicit reload needed.
    }
    setIsSending(false)
  }

  const selectConversation = (id: string) => {
    setSelectedId(id)
    router.push(`/dashboard/mensagens?id=${id}`)
  }

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedChat = conversations.find((c) => c.id === selectedId)

  return {
    conversations: filteredConversations,
    selectedChat,
    messages,
    selectedId,
    selectConversation,
    isLoadingConvs,
    isLoadingMsgs,
    newMessage,
    setNewMessage,
    isSending,
    myUserId,
    searchTerm,
    setSearchTerm,
    handleSend,
    messagesEndRef,
    scrollToBottom,
  }
}
