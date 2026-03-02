"use client"

import { Maximize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SessionChatProps {
    isChatOpen: boolean
    toggleChat: () => void
}

export function SessionChat({ isChatOpen, toggleChat }: SessionChatProps) {
    return (
        <aside className={cn(
            "w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col transition-all duration-300 absolute md:static right-0 h-full z-30",
            isChatOpen ? "translate-x-0" : "translate-x-full md:w-0 md:opacity-0 md:overflow-hidden border-none"
        )}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-100">Chat da Sessão</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden text-zinc-400" onClick={toggleChat}>
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4 bg-zinc-950/50">
                <div className="space-y-4">
                    <div className="text-center text-xs text-zinc-500 my-4">
                        <span>A sessão começou às 14:00</span>
                    </div>

                    {/* Received Message */}
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-1 border border-zinc-700">
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-2xl rounded-tl-none text-sm text-zinc-300 shadow-sm">
                                <p>Olá! Como você está se sentindo hoje?</p>
                            </div>
                            <span className="text-[10px] text-zinc-500 ml-1 mt-1 block">14:02</span>
                        </div>
                    </div>

                    {/* Sent Message */}
                    <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-md">
                            <p>Olá Dr. Carlos. Estou um pouco ansiosa, mas bem no geral.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-zinc-500 mr-1 mt-1 block">14:03</span>
                    </div>

                    {/* System Message */}
                    <div className="flex items-center justify-center gap-2 my-6">
                        <div className="h-px bg-zinc-800 w-12" />
                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">Sua conexão está estável</span>
                        <div className="h-px bg-zinc-800 w-12" />
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        placeholder="Digite sua mensagem..."
                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 text-zinc-300 placeholder:text-zinc-600"
                    />
                    <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </aside>
    )
}
