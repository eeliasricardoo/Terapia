"use client"

import { Mic, MicOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface VideoStageProps {
    isMicOn: boolean
    isVideoOn: boolean
    viewMode: 'grid' | 'speaker'
    isChatOpen: boolean
}

export function VideoStage({ isMicOn, isVideoOn, viewMode, isChatOpen }: VideoStageProps) {
    return (
        <div className="flex-1 p-4 flex items-center justify-center relative">
            <div className={cn(
                "transition-all duration-300 w-full h-full",
                viewMode === 'grid'
                    ? "grid gap-4 w-full h-full grid-cols-1 md:grid-cols-2"
                    : "relative flex items-center justify-center",
                isChatOpen ? "max-w-5xl" : "max-w-6xl"
            )}>

                {/* Remote Video (Doctor) */}
                <div className={cn(
                    "relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group transition-all duration-500",
                    viewMode === 'grid' ? "w-full h-full" : "w-full h-full"
                )}>
                    <img
                        src="/avatars/01.png"
                        alt="Dr. Remote"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="font-medium text-sm text-zinc-100">Dr. Carlos Rojas</span>
                        <Mic className="h-3 w-3 text-white/70" />
                    </div>
                </div>

                {/* Local Video (Self) */}
                <div className={cn(
                    "relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-500",
                    viewMode === 'grid'
                        ? "w-full h-full"
                        : "absolute bottom-8 right-8 w-48 h-36 md:w-64 md:h-48 shadow-2xl ring-1 ring-white/10 z-10"
                )}>
                    {isVideoOn ? (
                        <img
                            src="/avatars/user.png"
                            alt="Me"
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                            <Avatar className={cn(viewMode === 'grid' ? "h-32 w-32" : "h-12 w-12", "mb-4")}>
                                <AvatarImage src="/avatars/user.png" />
                                <AvatarFallback>JP</AvatarFallback>
                            </Avatar>
                            {viewMode === 'grid' && <p>Câmera desligada</p>}
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="font-medium text-sm text-zinc-100">Você</span>
                        {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
                    </div>
                </div>
            </div>
        </div>
    )
}
