'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDaily, useAppMessage } from '@daily-co/daily-react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RoomChat() {
  const daily = useDaily()
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string; isSelf: boolean }[]
  >([])
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleAppMessage = useCallback(
    (e: any) => {
      if (e && e.data && e.data.message) {
        const senderName =
          e.fromId && daily
            ? daily.participants()[e.fromId]?.user_name || 'Participante'
            : 'Participante'
        setMessages((prev) => [
          ...prev,
          {
            sender: senderName,
            text: e.data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
          },
        ])
      }
    },
    [daily]
  )

  const sendAppMessage = useAppMessage({
    onAppMessage: handleAppMessage,
  })

  const handleSendMessage = () => {
    const trimmed = newMessage.trim()
    if (!trimmed) return

    sendAppMessage({ message: trimmed })
    setMessages((prev) => [
      ...prev,
      {
        sender: 'Você',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
      },
    ])
    setNewMessage('')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center opacity-30 select-none">
            <div className="h-12 w-12 rounded-full border border-dashed border-zinc-950 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">
              Inicie uma conversa privada
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col gap-1.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-300',
                msg.isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {!msg.isSelf && (
                  <div className="h-4 w-4 bg-zinc-100 rounded-full flex items-center justify-center text-[8px] font-bold">
                    <User className="h-2 w-2" />
                  </div>
                )}
                <span className="text-[9px] font-extrabold uppercase tracking-tight text-zinc-400">
                  {msg.sender}
                </span>
                <span className="text-[8px] font-bold text-zinc-300">{msg.time}</span>
              </div>
              <div
                className={cn(
                  'text-sm px-4 py-2.5 rounded-2xl shadow-sm',
                  msg.isSelf
                    ? 'bg-zinc-950 text-white rounded-tr-none'
                    : 'bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-tl-none'
                )}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
        <div className="relative group/box transition-all">
          <input
            type="text"
            placeholder="Digite aqui sua mensagem..."
            className="w-full text-sm bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-12 py-3.5 focus:bg-white focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none placeholder:text-zinc-300"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within/box:text-zinc-900 transition-colors">
            <MessageSquare className="h-4 w-4" />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-0 disabled:scale-90 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2.5 flex justify-center">
          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <div className="h-1 w-1 bg-green-500 rounded-full" />
            Chat Seguro & Criptografado
          </p>
        </div>
      </div>
    </div>
  )
}
