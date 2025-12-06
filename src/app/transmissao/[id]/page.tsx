"use client"

import { useState, useEffect } from "react" // Added useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MessageSquare,
    MoreVertical,
    Settings,
    Shield,
    Send,
    Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TransmissionPage() {
    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(true)
    const [elapsedTime, setElapsedTime] = useState(0)

    // Mock Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="h-screen bg-slate-900 flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm">Telemedicina Segura</h1>
                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                            <Shield className="h-3 w-3" />
                            <span>Conexão Criptografada</span>
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm tracking-widest">{formatTime(elapsedTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden", isChatOpen && "text-blue-400")}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Video Area */}
                <div className="flex-1 p-4 flex items-center justify-center relative">
                    <div className={cn(
                        "grid gap-4 w-full h-full transition-all duration-300",
                        isChatOpen ? "max-w-5xl" : "max-w-6xl",
                        "grid-cols-1 md:grid-cols-2"
                    )}>

                        {/* Remote Video (Doctor) */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl group">
                            <img
                                src="/avatars/01.png" // Using avatar as placeholder for video feed, normally would be a video stream
                                alt="Dr. Remote"
                                className="w-full h-full object-cover opacity-90"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Name Tag */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="font-medium text-sm">Dr. Carlos Rojas</span>
                                <Mic className="h-3 w-3 text-white/70" />
                            </div>
                        </div>

                        {/* Local Video (Self) */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
                            {isVideoOn ? (
                                <img
                                    src="/avatars/user.png"
                                    alt="Me"
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                                    <Avatar className="h-32 w-32 mb-4">
                                        <AvatarImage src="/avatars/user.png" />
                                        <AvatarFallback>JP</AvatarFallback>
                                    </Avatar>
                                    <p>Câmera desligada</p>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Name Tag */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="font-medium text-sm">Você</span>
                                {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar (Floating) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl z-20">
                        <Button
                            variant="secondary"
                            size="icon"
                            className={cn("h-12 w-12 rounded-full transition-all", !isMicOn && "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20")}
                            onClick={() => setIsMicOn(!isMicOn)}
                        >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className={cn("h-12 w-12 rounded-full transition-all", !isVideoOn && "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20")}
                            onClick={() => setIsVideoOn(!isVideoOn)}
                        >
                            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border-blue-600/20 hidden md:flex"
                            onClick={() => setIsChatOpen(!isChatOpen)}
                        >
                            <MessageSquare className="h-5 w-5" />
                        </Button>
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
                </div>

                {/* Chat Sidebar */}
                <aside className={cn(
                    "w-80 bg-white border-l border-slate-200 flex flex-col transition-all duration-300 absolute md:static right-0 h-full z-30",
                    isChatOpen ? "translate-x-0" : "translate-x-full md:w-0 md:opacity-0 md:overflow-hidden border-none"
                )}>
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Chat da Sessão</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setIsChatOpen(false)}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                        <div className="space-y-4">
                            <div className="text-center text-xs text-slate-400 my-4">
                                <span>A sessão começou às 14:00</span>
                            </div>

                            {/* Received Message */}
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src="/avatars/01.png" />
                                    <AvatarFallback>DR</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm">
                                        <p>Olá! Como você está se sentindo hoje?</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 ml-1 mt-1 block">14:02</span>
                                </div>
                            </div>

                            {/* Sent Message */}
                            <div className="flex items-start gap-3 flex-row-reverse">
                                <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-md">
                                    <p>Olá Dr. Carlos. Estou um pouco ansiosa, mas bem no geral.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 mr-1 mt-1 block">14:03</span>
                            </div>

                            {/* System Message */}
                            <div className="flex items-center justify-center gap-2 my-6">
                                <div className="h-px bg-slate-200 w-12" />
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Sua conexão está estável</span>
                                <div className="h-px bg-slate-200 w-12" />
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                placeholder="Digite sua mensagem..."
                                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            />
                            <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </aside>
            </main>
        </div>
    )
}
