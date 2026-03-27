'use client'

import { Loader2, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { type MessageData } from '@/lib/actions/messages'
import { cn } from '@/lib/utils'

interface MessagesListProps {
  messages: MessageData[]
  myUserId: string | null
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessagesList({ messages, myUserId, isLoading, messagesEndRef }: MessagesListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 bg-slate-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Recuperando histórico...
        </p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6 bg-slate-50/30">
        <div className="h-20 w-20 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50">
          <Send className="h-8 w-8 text-slate-300" />
        </div>
        <div className="max-w-xs space-y-2">
          <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Diga olá!</p>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Inicie uma conversa segura agora mesmo. Todas as mensagens são privadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar scroll-smooth">
      {messages.map((msg, index) => {
        const isMe = msg.senderId === myUserId
        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId)
        const isFirstInBlock = index === 0 || messages[index - 1].senderId !== msg.senderId

        return (
          <div
            key={msg.id}
            className={cn(
              'flex items-end gap-3 animate-in slide-in-from-bottom-2 duration-500',
              isMe ? 'justify-end' : 'justify-start',
              isFirstInBlock ? 'mt-4' : 'mt-1'
            )}
          >
            {!isMe && (
              <div className="w-8 flex-shrink-0">
                {showAvatar ? (
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={msg.senderAvatar || undefined} />
                    <AvatarFallback className="text-[10px] font-black bg-slate-200 text-slate-500">
                      {msg.senderName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] md:max-w-[70%] px-5 py-3.5 shadow-sm transition-all hover:shadow-md relative group',
                isMe
                  ? 'bg-slate-900 text-white rounded-[1.5rem] rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-[1.5rem] rounded-bl-none'
              )}
            >
              <p className="text-[13px] font-medium leading-relaxed">{msg.content}</p>
              <div
                className={cn(
                  'flex items-center justify-end gap-1.5 mt-2 opacity-50 transition-opacity group-hover:opacity-100',
                  isMe ? 'text-white' : 'text-slate-400'
                )}
              >
                <p className="text-[8px] font-bold uppercase tracking-widest">
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
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
