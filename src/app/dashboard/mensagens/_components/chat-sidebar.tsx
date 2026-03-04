'use client'

import { Search, Loader2, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { type ConversationData } from '@/lib/actions/messages'

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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs text-slate-400 font-medium">Carregando chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 gap-2">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedId === chat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                  <AvatarImage src={chat.avatar || undefined} />
                  <AvatarFallback
                    className={
                      selectedId === chat.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="font-bold text-sm truncate">{chat.name}</p>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${selectedId === chat.id ? 'text-blue-100' : 'text-slate-400'}`}
                  >
                    {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'HH:mm') : ''}
                  </span>
                </div>
                <p
                  className={`text-xs truncate ${selectedId === chat.id ? 'text-blue-50' : 'text-slate-500'}`}
                >
                  {chat.lastMessage || 'Inicie uma conversa'}
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
  )
}
