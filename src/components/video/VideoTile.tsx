
"use client"

import { useEffect, useRef } from "react"
import { useMediaTrack, useParticipantProperty, DailyVideo } from "@daily-co/daily-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MicOff } from "lucide-react"

interface VideoTileProps {
    sessionId: string
    isLocal?: boolean
    className?: string
}

export function VideoTile({ sessionId, isLocal, className }: VideoTileProps) {
    const videoState = useMediaTrack(sessionId, "video")
    const audioState = useMediaTrack(sessionId, "audio")
    const userName = useParticipantProperty(sessionId, "user_name")

    const isLoading = videoState.state === "loading"
    const isOff = videoState.state === "off" || videoState.state === "interrupted" || videoState.state === "blocked"

    return (
        <div className={cn("relative bg-slate-900 rounded-xl overflow-hidden shadow-lg flex items-center justify-center isolate", className)}>
            <DailyVideo
                sessionId={sessionId}
                type="video"
                mirror={isLocal}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300 absolute inset-0",
                    isLoading || isOff ? "opacity-0" : "opacity-100"
                )}
            />

            {/* Fallback / Loading State */}
            {(isLoading || isOff) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-0">
                    <Avatar className="h-20 w-20 border-4 border-slate-700">
                        <AvatarFallback className="text-2xl font-bold bg-slate-600 text-slate-200">
                            {userName ? String(userName).slice(0, 2).toUpperCase() : "??"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                <span className="text-white text-sm font-medium drop-shadow-md truncate max-w-[80%]">
                    {userName} {isLocal && "(Você)"}
                </span>
                {(audioState.state === "off" || audioState.state === "blocked") && (
                    <div className="bg-red-500/80 p-1.5 rounded-full backdrop-blur-sm">
                        <MicOff className="h-3 w-3 text-white" />
                    </div>
                )}
            </div>
        </div>
    )
}
