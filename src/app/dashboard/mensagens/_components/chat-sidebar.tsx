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
    <Card className="w-full md:w-80 flex flex-col h-[400px] md:h-full border bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-sm">
      <div className="p-4 border-b bg-muted/30 space-y-4">
        <h2 className="font-heading font-bold text-xl text-foreground">Mensagens</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-9 h-10 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Carregando chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent',
                selectedId === chat.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border-primary/20'
                  : 'hover:bg-muted/50 text-foreground'
              )}
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  className={cn(
                    'h-11 w-11 border-2 shadow-sm',
                    selectedId === chat.id ? 'border-primary-foreground/20' : 'border-background'
                  )}
                >
                  <AvatarImage src={chat.avatar || undefined} />
                  <AvatarFallback
                    className={cn(
                      'font-medium',
                      selectedId === chat.id
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="font-bold text-sm truncate">{chat.name}</p>
                  <span
                    className={cn(
                      'text-[10px] font-medium whitespace-nowrap',
                      selectedId === chat.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'HH:mm') : ''}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-xs truncate',
                    selectedId === chat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {chat.lastMessage || 'Inicie uma conversa'}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <Badge
                  className={cn(
                    'h-5 min-w-[20px] rounded-full p-1 flex items-center justify-center text-[10px] font-bold border-none transition-transform group-hover:scale-110',
                    selectedId === chat.id
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-destructive text-white shadow-sm shadow-destructive/20'
                  )}
                >
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
