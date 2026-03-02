"use client"

import { Settings, Shield, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TransmissionHeaderProps {
    elapsedTime: number
    formatTime: (sec: number) => string
    isChatOpen: boolean
    toggleChat: () => void
}

export function TransmissionHeader({
    elapsedTime,
    formatTime,
    isChatOpen,
    toggleChat
}: TransmissionHeaderProps) {
    return (
        <header className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    T
                </div>
                <div>
                    <h1 className="font-semibold text-sm text-zinc-100">Telemedicina Segura</h1>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Shield className="h-3 w-3" />
                        <span>Conexão Criptografada</span>
                    </div>
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-zinc-700/50">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-sm tracking-widest text-zinc-100">{formatTime(elapsedTime)}</span>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Settings className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden", isChatOpen && "text-blue-400")}
                    onClick={toggleChat}
                >
                    <MessageSquare className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
