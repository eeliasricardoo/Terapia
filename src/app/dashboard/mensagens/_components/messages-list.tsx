'use client'

import { Loader2, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { type MessageData } from '@/lib/actions/messages'

interface MessagesListProps {
  messages: MessageData[]
  myUserId: string | null
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function MessagesList({ messages, myUserId, isLoading, messagesEndRef }: MessagesListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 bg-slate-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-400">Recuperando histórico...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 bg-slate-50/30">
        <div className="h-16 w-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <Send className="h-8 w-8 text-slate-200" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Diga olá! Inicie o diálogo aqui.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 pattern-dots">
      {messages.map((msg, index) => {
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
                    <AvatarFallback className="text-[8px] bg-slate-200">
                      {msg.senderName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                isMe
                  ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div
                className={`flex items-center justify-end gap-1.5 mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}
              >
                <p className="text-[9px] font-bold">{format(new Date(msg.createdAt), 'HH:mm')}</p>
                {isMe && <span className="text-[10px]">✓</span>}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
