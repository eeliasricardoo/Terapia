"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getConversations, getMessages, sendMessage, type ConversationData, type MessageData } from "@/lib/actions/messages"

export function useChat() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialId = searchParams.get("id")

    const [conversations, setConversations] = useState<ConversationData[]>([])
    const [messages, setMessages] = useState<MessageData[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(initialId)
    const [isLoadingConvs, setIsLoadingConvs] = useState(true)
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [myUserId, setMyUserId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }, [])

    useEffect(() => {
        const loadInitial = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setMyUserId(user.id)

            const convs = await getConversations()
            setConversations(convs)
            setIsLoadingConvs(false)

            if (initialId && !selectedId) {
                setSelectedId(initialId)
            }
        }
        loadInitial()
    }, [supabase, initialId, selectedId])

    const loadMessages = useCallback(async (id: string) => {
        setIsLoadingMsgs(true)
        const msgs = await getMessages(id)
        setMessages(msgs)
        setIsLoadingMsgs(false)
        setTimeout(() => scrollToBottom("auto"), 100)
    }, [scrollToBottom])

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
                    (payload) => {
                        const newMsg = payload.new as any
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev
                            return [...prev, {
                                id: newMsg.id,
                                content: newMsg.content,
                                senderId: newMsg.sender_id,
                                senderName: '...',
                                createdAt: new Date(newMsg.created_at)
                            } as MessageData]
                        })
                        setTimeout(() => scrollToBottom("smooth"), 50)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [selectedId, loadMessages, supabase, scrollToBottom])

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedId || isSending) return

        setIsSending(true)
        const result = await sendMessage(selectedId, newMessage.trim())
        if (result.success) {
            setNewMessage("")
            loadMessages(selectedId)
        }
        setIsSending(false)
    }

    const selectConversation = (id: string) => {
        setSelectedId(id)
        router.push(`/dashboard/mensagens?id=${id}`)
    }

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedChat = conversations.find(c => c.id === selectedId)

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
        scrollToBottom
    }
}
