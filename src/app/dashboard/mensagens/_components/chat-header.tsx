"use client"

import { Phone, Video, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type ConversationData } from "@/lib/actions/messages"

interface ChatHeaderProps {
    chat: ConversationData | undefined
}

export function ChatHeader({ chat }: ChatHeaderProps) {
    return (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={chat?.avatar || undefined} />
                    <AvatarFallback className="bg-slate-900 text-white font-medium">
                        {chat?.name.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-slate-900 tracking-tight">{chat?.name || "Carregando..."}</h3>
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
    )
}
