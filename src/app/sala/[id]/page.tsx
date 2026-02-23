
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDaily, DailyProvider, DailyAudio, DailyVideo, useParticipantIds, useLocalParticipant, useMeetingState, useAppMessage } from "@daily-co/daily-react"
import DailyIframe, { DailyCall } from "@daily-co/daily-js"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
    MessageSquare, FileText, Smile, User, Loader2, Clock
} from "lucide-react"

// Import custom VideoTile
import { VideoTile } from "@/components/video/VideoTile"
import { PreJoinLobby } from "@/components/video/PreJoinLobby"

interface AppointmentInfo {
    scheduledAt: string;
    durationMinutes: number;
    isPsychologist: boolean;
}

export default function VideoRoomPage({ params }: { params: { id: string } }) {
    const [roomUrl, setRoomUrl] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [callObject, setCallObject] = useState<DailyCall | null>(null)

    // Fetch Token
    useEffect(() => {
        async function init() {
            try {
                const res = await fetch("/api/video/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ appointmentId: params.id })
                })

                if (!res.ok) {
                    const errorText = await res.text()
                    let errorMessage = errorText || "Falha ao obter token da sala"
                    try {
                        const errorJson = JSON.parse(errorText)
                        if (errorJson.error) {
                            errorMessage = errorJson.error
                        }
                    } catch (e) {
                        // Ignore parse error, use original text
                    }
                    throw new Error(errorMessage)
                }

                const data = await res.json()
                setRoomUrl(data.url)
                setToken(data.token)
                setAppointmentInfo({
                    scheduledAt: data.scheduledAt,
                    durationMinutes: data.durationMinutes,
                    isPsychologist: data.isPsychologist
                })
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        init()
    }, [params.id])

    useEffect(() => {
        if (!roomUrl || !token) return

        let co = (DailyIframe as any).getCallInstance();

        if (!co) {
            co = DailyIframe.createCallObject({
                url: roomUrl,
                token: token,
                audioSource: true,
                videoSource: true,
            })
        }

        setCallObject(co)

        return () => {
            if (co) {
                co.destroy().catch((e: any) => console.error("Error destroying daily", e))
            }
        }
    }, [roomUrl, token])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                <Card className="max-w-md w-full border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <VideoOff className="h-5 w-5" /> Erro na Sala
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Tentar Novamente</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isLoading || !roomUrl || !token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-slate-400 animate-pulse">Preparando sala de atendimento...</p>
            </div>
        )
    }

    if (!callObject) return null // Or keep loading state visible

    return (
        <DailyProvider callObject={callObject}>
            <RoomManager appointmentId={params.id} appointmentInfo={appointmentInfo!} />
        </DailyProvider>
    )
}

function RoomManager({ appointmentId, appointmentInfo }: { appointmentId: string, appointmentInfo: AppointmentInfo }) {
    const meetingState = useMeetingState()

    // Only show Active Room if fully joined
    if (meetingState === "joined-meeting") {
        return <ActiveRoomInterface appointmentId={appointmentId} appointmentInfo={appointmentInfo} />
    }

    return <PreJoinLobby />
}

function ActiveRoomInterface({ appointmentId, appointmentInfo }: { appointmentId: string, appointmentInfo: AppointmentInfo }) {
    const daily = useDaily()
    const router = useRouter()
    const localParticipant = useLocalParticipant()
    const remoteParticipantIds = useParticipantIds({ filter: "remote" })

    const [isMicOn, setIsMicOn] = useState(true)
    const [isCamOn, setIsCamOn] = useState(true)
    const [remainingSeconds, setRemainingSeconds] = useState(0)

    // Chat functionality
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string }[]>([])
    const [newMessage, setNewMessage] = useState("")

    const handleAppMessage = useCallback((e: any) => {
        if (e && e.data && e.data.message) {
            const senderName = e.fromId && daily ? daily.participants()[e.fromId]?.user_name || 'Participante' : 'Participante';
            setMessages((prev) => [...prev, {
                sender: senderName,
                text: e.data.message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        }
    }, [daily])

    const sendAppMessage = useAppMessage({
        onAppMessage: handleAppMessage,
    })

    const handleSendMessage = () => {
        if (!newMessage.trim()) return
        sendAppMessage({ message: newMessage })
        setMessages((prev) => [...prev, {
            sender: 'Você',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
        setNewMessage("")
    }

    // Timer logic
    useEffect(() => {
        if (!appointmentInfo) return

        const startTime = new Date(appointmentInfo.scheduledAt).getTime()
        const endTime = startTime + (appointmentInfo.durationMinutes * 60000)

        const timer = setInterval(() => {
            const now = new Date().getTime()
            const diff = Math.floor((endTime - now) / 1000)

            if (diff > 0) {
                setRemainingSeconds(diff)
            } else {
                setRemainingSeconds(0)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [appointmentInfo])

    const toggleMic = useCallback(() => {
        if (!daily) return
        daily.setLocalAudio(!isMicOn)
        setIsMicOn(!isMicOn)
    }, [daily, isMicOn])

    const toggleCam = useCallback(() => {
        if (!daily) return
        daily.setLocalVideo(!isCamOn)
        setIsCamOn(!isCamOn)
    }, [daily, isCamOn])

    const leaveCall = useCallback(() => {
        if (!daily) return
        daily.leave().then(() => {
            router.push("/dashboard")
        })
    }, [daily, router])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const isFiveMinutesWarning = remainingSeconds > 0 && remainingSeconds <= 300 // 5 minutes

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
            {/* Header */}
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
                        {remoteParticipantIds.length > 0 ? "2 Participantes" : "Aguardando..."}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={leaveCall} className="gap-2">
                        <PhoneOff className="h-4 w-4" /> Finalizar
                    </Button>
                </div>
            </header>

            {/* Main Content: Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Video Area (65%) */}
                <div className="flex-[2] bg-slate-900 p-4 relative flex flex-col items-center justify-center gap-4">

                    {/* Main Stage (Usually Remote) */}
                    <div className="flex-1 w-full max-w-5xl flex items-center justify-center">
                        {remoteParticipantIds.length > 0 ? (
                            remoteParticipantIds.map((id) => (
                                <div key={id} className="w-full h-full max-h-[calc(100vh-200px)] aspect-video">
                                    <VideoTile
                                        sessionId={id}
                                        className="w-full h-full rounded-2xl border border-slate-800 shadow-2xl"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 space-y-4 animate-pulse">
                                <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center">
                                    <User className="h-16 w-16 opacity-50" />
                                </div>
                                <p>Aguardando o outro participante entrar...</p>
                            </div>
                        )}
                    </div>

                    {/* Local User (Picture-in-Picture Style) */}
                    <div className="absolute top-4 right-4 w-48 aspect-video shadow-2xl z-20">
                        {localParticipant && (
                            <VideoTile
                                sessionId={localParticipant.session_id}
                                isLocal
                                className="w-full h-full rounded-xl border-2 border-slate-700 bg-slate-800"
                            />
                        )}
                    </div>

                    {/* Controls Bar */}
                    <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center gap-4 shadow-xl mb-4">
                        <Button
                            variant={isMicOn ? "secondary" : "destructive"}
                            size="icon"
                            className="rounded-full h-12 w-12"
                            onClick={toggleMic}
                        >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </Button>

                        <Button
                            variant={isCamOn ? "secondary" : "destructive"}
                            size="icon"
                            className="rounded-full h-12 w-12"
                            onClick={toggleCam}
                        >
                            {isCamOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>

                        <Separator orientation="vertical" className="h-8 bg-white/20" />

                        {/* Layout Toggle (Placeholder) */}
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-white hover:bg-white/10">
                            <MessageSquare className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Right: Tools/Records Area (35%) */}
                <div className="flex-1 bg-white border-l border-slate-200 flex flex-col min-w-[350px] max-w-[450px]">
                    <Tabs defaultValue={appointmentInfo?.isPsychologist ? "record" : "chat"} className="flex-1 flex flex-col">
                        <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50">
                            <TabsList className={cn("grid w-full", appointmentInfo?.isPsychologist ? "grid-cols-3" : "grid-cols-1")}>
                                {appointmentInfo?.isPsychologist && (
                                    <>
                                        <TabsTrigger value="record" className="text-xs">
                                            <FileText className="h-3.5 w-3.5 mr-2" />
                                            Prontuário
                                        </TabsTrigger>
                                        <TabsTrigger value="notes" className="text-xs">
                                            <Smile className="h-3.5 w-3.5 mr-2" />
                                            Evolução
                                        </TabsTrigger>
                                    </>
                                )}
                                <TabsTrigger value="chat" className="text-xs">
                                    <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                    Chat
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
                            {appointmentInfo?.isPsychologist && (
                                <>
                                    <TabsContent value="record" className="p-4 m-0 flex-1 overflow-y-auto space-y-4 data-[state=active]:flex data-[state=active]:flex-col">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Histórico Recente</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-slate-500">
                                                <p>15 Fev - Sessão Regular (Ansiedade Social)</p>
                                                <Separator className="my-2" />
                                                <p>10 Fev - Primeira Consulta</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Dados do Paciente</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="font-semibold">Nome:</span>
                                                    <span>Ana Silva</span>
                                                    <span className="font-semibold">Idade:</span>
                                                    <span>32 anos</span>
                                                    <span className="font-semibold">Queixa:</span>
                                                    <span>Ansiedade, Insônia</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="notes" className="p-4 m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                                        <textarea
                                            className="w-full flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm"
                                            placeholder="Faça suas anotações da sessão aqui..."
                                        ></textarea>
                                        <div className="mt-4 flex justify-end shrink-0">
                                            <Button size="sm">Salvar Evolução</Button>
                                        </div>
                                    </TabsContent>
                                </>
                            )}

                            <TabsContent value="chat" className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col h-full items-center justify-center text-slate-400 grayscale opacity-70">
                                            <MessageSquare className="h-10 w-10 mb-2" />
                                            <p className="text-sm">Nenhuma mensagem no chat.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={i} className={cn("text-sm p-3 rounded-lg max-w-[85%]", msg.sender === 'Você' ? "bg-blue-100 text-blue-900 self-end ml-auto" : "bg-slate-100 text-slate-900 self-start mr-auto")}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-xs opacity-75">{msg.sender}</span>
                                                    <span className="text-[10px] opacity-50 ml-2">{msg.time}</span>
                                                </div>
                                                <p>{msg.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Digite uma mensagem..."
                                        className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage} size="icon" className="rounded-full shrink-0">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            {/* Invisible Handles for Daily Audio */}
            <DailyAudio />
        </div>
    )
}
