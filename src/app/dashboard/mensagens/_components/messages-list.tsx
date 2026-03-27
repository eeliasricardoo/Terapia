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
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 bg-muted/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Recuperando histórico...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 bg-muted/5">
        <div className="h-16 w-16 rounded-full bg-background border flex items-center justify-center shadow-sm">
          <Send className="h-8 w-8 text-muted/50" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Diga olá! Inicie o diálogo aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 custom-scrollbar">
      {messages.map((msg, index) => {
        const isMe = msg.senderId === myUserId
        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId)

        return (
          <div
            key={msg.id}
            className={cn(
              'flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-300',
              isMe ? 'justify-end' : 'justify-start'
            )}
          >
            {!isMe && (
              <div className="h-6 w-6 flex-shrink-0">
                {showAvatar && (
                  <Avatar className="h-6 w-6 border shadow-sm">
                    <AvatarImage src={msg.senderAvatar || undefined} />
                    <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                      {msg.senderName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
            <div
              className={cn(
                'max-w-[75%] rounded-2xl p-3 shadow-xs transition-all hover:shadow-sm',
                isMe
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground border border-border/50 rounded-bl-none'
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div
                className={cn(
                  'flex items-center justify-end gap-1.5 mt-1',
                  isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
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
