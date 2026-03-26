'use client'

import { Phone, Video, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type ConversationData } from '@/lib/actions/messages'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  chat: ConversationData | undefined
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between bg-background/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border shadow-sm">
          <AvatarImage src={chat?.avatar || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {chat?.name.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-heading font-bold text-foreground tracking-tight leading-none mb-1">
            {chat?.name || 'Carregando...'}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Atendimento Ativo
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
