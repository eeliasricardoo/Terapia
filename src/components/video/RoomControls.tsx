"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mic, MicOff, Video as VideoIcon, VideoOff, MessageSquare } from "lucide-react"

interface RoomControlsProps {
    isMicOn: boolean;
    isCamOn: boolean;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onToggleChat?: () => void;
}

export function RoomControls({ isMicOn, isCamOn, onToggleMic, onToggleCam, onToggleChat }: RoomControlsProps) {
    return (
        <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center gap-4 shadow-xl mb-4">
            <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={onToggleMic}
            >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
                variant={isCamOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={onToggleCam}
            >
                {isCamOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Separator orientation="vertical" className="h-8 bg-white/20" />

            {/* Layout Toggle or Chat Toggle (Placeholder or functional) */}
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-12 w-12 text-white hover:bg-white/10"
                onClick={onToggleChat}
            >
                <MessageSquare className="h-5 w-5" />
            </Button>
        </div>
    )
}
