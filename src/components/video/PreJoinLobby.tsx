
"use client"

import { useDaily, useLocalParticipant, useMediaTrack } from "@daily-co/daily-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, Settings, Sparkles } from "lucide-react"
import { DeviceSettings } from "./DeviceSettings"
import { VideoTile } from "./VideoTile"

export function PreJoinLobby() {
    const daily = useDaily()
    const localParticipant = useLocalParticipant()
    const audioTrack = useMediaTrack(localParticipant?.session_id || "", "audio")
    const videoTrack = useMediaTrack(localParticipant?.session_id || "", "video")

    const [isMicOn, setIsMicOn] = useState(true)
    const [isCamOn, setIsCamOn] = useState(true)

    // Start preview when component mounts
    useEffect(() => {
        if (!daily) return
        console.log("Starting Local Preview...")
        daily.startCamera({ audioSource: true, videoSource: true }).catch(err => {
            console.error("Failed to start camera preview", err)
        })

        // Cleanup strictly on unmount not needed as next step is join
    }, [daily])

    const toggleMic = () => {
        if (!daily) return
        const newState = !isMicOn
        daily.setLocalAudio(newState)
        setIsMicOn(newState)
    }

    const toggleCam = () => {
        if (!daily) return
        const newState = !isCamOn
        daily.setLocalVideo(newState)
        setIsCamOn(newState)
    }

    const handleJoin = () => {
        if (!daily) return
        daily.join()
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 animate-in fade-in zoom-in duration-500">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left: Preview */}
                <div className="space-y-6 flex flex-col items-center">
                    <div className="flex flex-col items-center text-center space-y-2 mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 px-3 py-1">
                            <Sparkles className="h-3.5 w-3.5" /> Sala de Espera
                        </Badge>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prepare-se para entrar</h1>
                        <p className="text-slate-500">Verifique sua câmera e microfone antes da sessão.</p>
                    </div>

                    <div className="relative w-full max-w-md aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white">
                        {localParticipant ? (
                            <VideoTile
                                sessionId={localParticipant.session_id}
                                isLocal
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-slate-500 bg-slate-900">
                                <p>Carregando preview...</p>
                            </div>
                        )}

                        {/* Controls Overlay */}
                        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4 z-20">
                            <Button
                                variant={isMicOn ? "secondary" : "destructive"}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg border-2 border-transparent hover:border-white/20"
                                onClick={toggleMic}
                            >
                                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                            <Button
                                variant={isCamOn ? "secondary" : "destructive"}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg border-2 border-transparent hover:border-white/20"
                                onClick={toggleCam}
                            >
                                {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Audio Level Meter (Simple CSS implementation) */}
                    <div className="w-full max-w-md bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        {/* Note: implementing true audio meter requires AudioContext access which is simpler to fake/omit for MVP or use Daily's hook */}
                        <div className="h-full bg-green-500 w-1/2 opacity-50 animate-pulse"></div>
                    </div>
                </div>

                {/* Right: Settings & Join */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8 h-fit">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
                            <Settings className="h-5 w-5 text-slate-500" />
                            Configurações de Dispositivos
                        </div>

                        <DeviceSettings />
                    </div>

                    <Separator />

                    <div className="space-y-4 pt-2">
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                            onClick={handleJoin}
                        >
                            Entrar na Sala Agora
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            Ao entrar, você concorda com nossos termos de telemedicina e gravação de sessão para segurança.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
