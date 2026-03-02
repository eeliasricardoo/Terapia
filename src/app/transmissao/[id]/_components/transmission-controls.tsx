"use client"

import { Mic, MicOff, Video, VideoOff, LayoutDashboard, Minimize, MessageSquare, CalendarClock, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RescheduleDialog } from "@/components/dashboard/RescheduleDialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransmissionControlsProps {
    isMicOn: boolean
    toggleMic: () => void
    isVideoOn: boolean
    toggleVideo: () => void
    viewMode: 'grid' | 'speaker'
    setViewMode: (mode: 'grid' | 'speaker') => void
    isChatOpen: boolean
    toggleChat: () => void
}

export function TransmissionControls({
    isMicOn, toggleMic,
    isVideoOn, toggleVideo,
    viewMode, setViewMode,
    isChatOpen, toggleChat
}: TransmissionControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl z-20 overflow-visible">
            <Button
                variant="secondary"
                size="icon"
                className={cn("h-12 w-12 rounded-full transition-all text-zinc-100", !isMicOn && "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20")}
                onClick={toggleMic}
            >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
                variant="secondary"
                size="icon"
                className={cn("h-12 w-12 rounded-full transition-all text-zinc-100", !isVideoOn && "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20")}
                onClick={toggleVideo}
            >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {/* Layout Switcher */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-full transition-all border-white/5 bg-white/5 hover:bg-white/10 text-white hidden md:flex"
                        title="Alterar Layout"
                    >
                        {viewMode === 'grid' ? <LayoutDashboard className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-zinc-900 border-zinc-800 text-zinc-100 mb-2">
                    <DropdownMenuItem onClick={() => setViewMode('grid')} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Grade (Grid)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('speaker')} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
                        <Minimize className="mr-2 h-4 w-4" />
                        <span>Destacar (Speaker)</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="secondary"
                size="icon"
                className={cn("h-12 w-12 rounded-full transition-all md:flex border-white/5 bg-white/5 hover:bg-white/10 text-white", isChatOpen && "bg-blue-600/10 text-blue-500 border-blue-600/20 hover:bg-blue-600/20")}
                onClick={toggleChat}
            >
                <MessageSquare className="h-5 w-5" />
            </Button>

            <RescheduleDialog
                session={{
                    id: 1,
                    doctor: "Dr. Carlos Rojas",
                    role: "Psicólogo Clínico",
                    image: "/avatars/01.png",
                    date: "06/12",
                    time: "14:00"
                }}
            >
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full transition-all md:flex border-white/5 bg-white/5 hover:bg-white/10 text-white"
                    title="Reagendar Sessão"
                >
                    <CalendarClock className="h-5 w-5" />
                </Button>
            </RescheduleDialog>

            <div className="w-px h-8 bg-white/10 mx-2" />
            <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                onClick={() => window.location.href = '/dashboard/sessoes'}
            >
                <PhoneOff className="h-5 w-5" />
            </Button>
        </div>
    )
}
