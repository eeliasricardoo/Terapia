'use client'

import { Search, Loader2, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { type ConversationData } from '@/lib/actions/messages'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  conversations: ConversationData[]
  selectedId: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  isLoading: boolean
  onSelect: (id: string) => void
}

export function ChatSidebar({
  conversations,
  selectedId,
  searchTerm,
  setSearchTerm,
  isLoading,
  onSelect,
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-[400px] md:h-full border border-slate-200/60 bg-white overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
      <div className="p-6 border-b border-slate-100 space-y-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Conversas</h2>
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-10 h-11 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all placeholder:text-slate-400 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-100">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Carregando...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <MessageSquare className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed uppercase tracking-widest">
              Nenhuma conversa
            </p>
          </div>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 border group items-stretch',
                selectedId === chat.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'hover:bg-slate-50 border-transparent text-slate-600'
              )}
            >
              <div className="relative flex-shrink-0 self-center">
                <Avatar
                  className={cn(
                    'h-12 w-12 border-2 transition-transform duration-500 group-hover:scale-105',
                    selectedId === chat.id ? 'border-white/20' : 'border-white shadow-sm'
                  )}
                >
                  <AvatarImage src={chat.avatar || undefined} />
                  <AvatarFallback
                    className={cn(
                      'font-bold text-xs',
                      selectedId === chat.id
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2',
                    selectedId === chat.id
                      ? 'bg-emerald-400 border-slate-900'
                      : 'bg-emerald-500 border-white'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p
                    className={cn(
                      'font-bold text-sm truncate tracking-tight',
                      selectedId === chat.id ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {chat.name}
                  </p>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-60 ml-2',
                      selectedId === chat.id ? 'text-white' : 'text-slate-400'
                    )}
                  >
                    {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'HH:mm') : ''}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-xs truncate font-medium',
                    selectedId === chat.id ? 'text-white/70' : 'text-slate-400'
                  )}
                >
                  {chat.lastMessage || 'Inicie uma conversa'}
                </p>
              </div>

              {chat.unreadCount > 0 && selectedId !== chat.id && (
                <div className="flex items-center ml-2">
                  <Badge className="h-5 min-w-[20px] rounded-full p-1 flex items-center justify-center text-[10px] font-bold bg-slate-900 text-white border-none">
                    {chat.unreadCount}
                  </Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
