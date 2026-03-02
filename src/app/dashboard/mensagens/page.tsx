"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Loader2, MessageSquare } from "lucide-react"
import { getConversations, getMessages, sendMessage, type ConversationData, type MessageData } from "@/lib/actions/messages"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MessagesPage() {
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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
        setTimeout(scrollToBottom, 100)
    }, [])

    useEffect(() => {
        if (selectedId) {
            loadMessages(selectedId)

            // Subscribe to real-time messages
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
                        // Only add if not already there (prevents duplication if server action also triggers update)
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev
                            return [...prev, {
                                id: newMsg.id,
                                content: newMsg.content,
                                senderId: newMsg.sender_id,
                                senderName: '...', // Name will be loaded on next full load or we could optimize
                                createdAt: new Date(newMsg.created_at)
                            } as MessageData]
                        })
                        setTimeout(scrollToBottom, 50)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [selectedId, loadMessages, supabase])

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedId || isSending) return

        setIsSending(true)
        const result = await sendMessage(selectedId, newMessage.trim())
        if (result.success) {
            setNewMessage("")
            // Refresh local message list immediately to show the name correctly
            loadMessages(selectedId)
        }
        setIsSending(false)
    }

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedChat = conversations.find(c => c.id === selectedId)

    return (
        <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
            {/* Sidebar / Conversation List */}
            <Card className="w-full md:w-80 flex flex-col h-[400px] md:h-full border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
                    <h2 className="font-bold text-xl text-slate-900">Mensagens</h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Buscar conversas..."
                            className="pl-9 h-10 rounded-xl border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoadingConvs ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            <p className="text-xs text-slate-400 font-medium">Carregando chats...</p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4 gap-2">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Nenhuma conversa encontrada</p>
                        </div>
                    ) : (
                        filteredConversations.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    setSelectedId(chat.id)
                                    router.push(`/dashboard/mensagens?id=${chat.id}`)
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedId === chat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                    : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                                        <AvatarImage src={chat.avatar || undefined} />
                                        <AvatarFallback className={selectedId === chat.id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"}>
                                            {chat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="font-bold text-sm truncate">{chat.name}</p>
                                        <span className={`text-[10px] font-medium whitespace-nowrap ${selectedId === chat.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), "HH:mm") : ""}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${selectedId === chat.id ? 'text-blue-50' : 'text-slate-500'}`}>
                                        {chat.lastMessage || "Inicie uma conversa"}
                                    </p>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <Badge className="h-5 min-w-[20px] rounded-full p-1 bg-red-500 text-white flex items-center justify-center text-[10px] font-bold border-none">
                                        {chat.unreadCount}
                                    </Badge>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col h-full border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden rounded-2xl">
                {!selectedId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4 bg-slate-50/30">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-100 animate-bounce">
                            <Send className="h-10 w-10 text-white" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Seu Chat Direto</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Selecione uma conversa para trocar mensagens realistas e seguras com seu terapeuta ou paciente.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                    <AvatarImage src={selectedChat?.avatar || undefined} />
                                    <AvatarFallback className="bg-slate-900 text-white font-medium">
                                        {selectedChat?.name.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-slate-900 tracking-tight">{selectedChat?.name || "Carregando..."}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendimento Ativo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Video className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 pattern-dots">
                            {isLoadingMsgs ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm font-medium text-slate-400">Recuperando histórico...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
                                    <div className="h-16 w-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Send className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Diga olá! Inicie o diálogo aqui.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === myUserId
                                    const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId)

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            {!isMe && (
                                                <div className="h-6 w-6 flex-shrink-0">
                                                    {showAvatar && (
                                                        <Avatar className="h-6 w-6 border border-slate-100">
                                                            <AvatarImage src={msg.senderAvatar || undefined} />
                                                            <AvatarFallback className="text-[8px] bg-slate-200">{msg.senderName.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100'
                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <div className={`flex items-center justify-end gap-1.5 mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    <p className="text-[9px] font-bold">
                                                        {format(new Date(msg.createdAt), "HH:mm")}
                                                    </p>
                                                    {isMe && <span className="text-[10px]">✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Digite sua mensagem profissional..."
                                        className="h-12 flex-1 border-slate-200 rounded-2xl pr-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSend()
                                            }
                                        }}
                                        disabled={isSending}
                                    />
                                    <Button
                                        size="icon"
                                        className={`absolute right-1 top-1 h-10 w-10 rounded-xl transition-all ${newMessage.trim() ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}
                                        onClick={handleSend}
                                        disabled={!newMessage.trim() || isSending}
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
