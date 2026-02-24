"use client"

import { Clock, User, PhoneOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RoomHeaderProps {
    remainingSeconds: number;
    remoteParticipantCount: number;
    onLeave: () => void;
}

export function RoomHeader({ remainingSeconds, remoteParticipantCount, onLeave }: RoomHeaderProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const isFiveMinutesWarning = remainingSeconds > 0 && remainingSeconds <= 300 // 5 minutes

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-2 py-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Em Atendimento
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <div className={cn("flex items-center gap-2 font-mono text-sm px-2 py-1 rounded-md border", isFiveMinutesWarning ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100")}>
                    <Clock className="h-4 w-4" />
                    {formatTime(remainingSeconds)}
                    {isFiveMinutesWarning && <span className="ml-1 font-bold">5 min finais!</span>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-slate-500">
                    <User className="h-4 w-4 mr-2" />
                    {remoteParticipantCount > 0 ? `${remoteParticipantCount + 1} Participantes` : "Aguardando..."}
                </Button>
                <Button variant="destructive" size="sm" onClick={onLeave} className="gap-2">
                    <PhoneOff className="h-4 w-4" /> Finalizar
                </Button>
            </div>
        </header>
    )
}
