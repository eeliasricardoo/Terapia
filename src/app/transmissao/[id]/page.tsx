"use client"

import { useState, useEffect } from "react"
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
    Maximize2,
    CalendarClock,
    LayoutDashboard,
    Minimize
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RescheduleDialog } from "@/components/dashboard/RescheduleDialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TransmissionPage() {
    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')

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
        <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
            {/* Header */}
            <header className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-10 shrink-0">
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

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-zinc-700/50">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm tracking-widest">{formatTime(elapsedTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden", isChatOpen && "text-blue-400")}
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
                                <span className="font-medium text-sm">Dr. Carlos Rojas</span>
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
                                <span className="font-medium text-sm">Você</span>
                                {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar (Floating) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl z-20 overflow-visible">
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
                            onClick={() => setIsChatOpen(!isChatOpen)}
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
                </div>

                {/* Chat Sidebar */}
                <aside className={cn(
                    "w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col transition-all duration-300 absolute md:static right-0 h-full z-30",
                    isChatOpen ? "translate-x-0" : "translate-x-full md:w-0 md:opacity-0 md:overflow-hidden border-none"
                )}>
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="font-semibold text-zinc-100">Chat da Sessão</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden text-zinc-400" onClick={() => setIsChatOpen(false)}>
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
            </main>
        </div>
    )
}
