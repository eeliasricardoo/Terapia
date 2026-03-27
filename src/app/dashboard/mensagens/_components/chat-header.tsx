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
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <div className="relative group cursor-pointer">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-105">
            <AvatarImage src={chat?.avatar || undefined} />
            <AvatarFallback className="bg-slate-900 text-white font-bold text-xs uppercase">
              {chat?.name.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none mb-1.5">
            {chat?.name || 'Carregando...'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              Atendimento Online
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
        >
          <Video className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-slate-100 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
