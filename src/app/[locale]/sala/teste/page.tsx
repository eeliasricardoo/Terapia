'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useDaily,
  DailyProvider,
  DailyAudio,
  useParticipantIds,
  useMeetingState,
  useLocalParticipant,
} from '@daily-co/daily-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { PanelRight, VideoOff, Loader2, User, Stethoscope } from 'lucide-react'

import { PreJoinLobby } from '@/components/video/PreJoinLobby'
import { RoomControls } from '@/components/video/RoomControls'
import { VideoStage } from '@/components/video/VideoStage'
import { RoomSidebar } from '@/components/video/RoomSidebar'
import { useRoomTimer } from '@/hooks/useRoomTimer'
import { useTestRoomConnection } from '@/hooks/useTestRoomConnection'
import { AppointmentInfo } from '@/hooks/useRoomConnection'

export default function VideoRoomTestPage() {
  const [role, setRole] = useState<'psychologist' | 'patient' | null>(null)
  const { appointmentInfo, error, isLoading, callObject, roomUrl, token } =
    useTestRoomConnection(role)

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-900 text-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight mb-2">
              Teste de Video Chamada
            </CardTitle>
            <CardDescription className="text-zinc-400 font-medium">
              Selecione o perfil para entrar na sala.
              <br />
              <span className="text-blue-400">Dica:</span> Abra em duas abas para simular a chamada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-4 h-20 border-zinc-700 hover:border-blue-500 hover:bg-blue-500/10 text-xl font-bold group transition-all"
              onClick={() => setRole('psychologist')}
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Stethoscope className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex flex-col items-start">
                <span>Sou o Psicólogo</span>
                <span className="text-xs font-medium text-zinc-500">
                  Acesso a prontuário e evolução
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-4 h-20 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-xl font-bold group transition-all"
              onClick={() => setRole('patient')}
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <User className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex flex-col items-start">
                <span>Sou o Paciente</span>
                <span className="text-xs font-medium text-zinc-500">
                  Visualização simplificada da sala
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <VideoOff className="h-5 w-5" /> Erro no Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 flex-1 text-white"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => setRole(null)}
              >
                Mudar Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !callObject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 animate-pulse">Preparando sala de teste...</p>
      </div>
    )
  }

  return (
    <DailyProvider callObject={callObject}>
      <TestRoomManager appointmentInfo={appointmentInfo!} roomUrl={roomUrl!} token={token!} />
      <DailyAudio />
    </DailyProvider>
  )
}

function TestRoomManager({
  appointmentInfo,
  roomUrl,
  token,
}: {
  appointmentInfo: AppointmentInfo
  roomUrl: string
  token: string
}) {
  const meetingState = useMeetingState()

  if (meetingState === 'joining-meeting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400">Entrando na sala de teste...</p>
      </div>
    )
  }

  if (meetingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
        <p className="text-red-500 font-semibold mb-2">Erro na conexão de vídeo</p>
        <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
      </div>
    )
  }

  if (meetingState === 'joined-meeting') {
    return <TestActiveRoomInterface appointmentInfo={appointmentInfo} />
  }

  return <PreJoinLobby roomUrl={roomUrl} token={token} />
}

function TestActiveRoomInterface({ appointmentInfo }: { appointmentInfo: AppointmentInfo }) {
  const daily = useDaily()
  const router = useRouter()
  const localParticipant = useLocalParticipant()

  const [isMicOn, setIsMicOn] = useState(localParticipant?.audio ?? true)
  const [isCamOn, setIsCamOn] = useState(localParticipant?.video ?? true)
  const [activeTab, setActiveTab] = useState(appointmentInfo?.isPsychologist ? 'record' : 'info')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (localParticipant) {
      if (localParticipant.audio !== isMicOn) setIsMicOn(localParticipant.audio)
      if (localParticipant.video !== isCamOn) setIsCamOn(localParticipant.video)
    }
  }, [localParticipant?.audio, localParticipant?.video])

  const remainingSeconds = useRoomTimer(
    appointmentInfo.scheduledAt,
    appointmentInfo.durationMinutes
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleMic = useCallback(() => {
    if (!daily || daily.isDestroyed()) return
    const newState = !isMicOn
    daily.setLocalAudio(newState)
    setIsMicOn(newState)
  }, [daily, isMicOn])

  const toggleCam = useCallback(() => {
    if (!daily || daily.isDestroyed()) return
    const newState = !isCamOn
    daily.setLocalVideo(newState)
    setIsCamOn(newState)
  }, [daily, isCamOn])

  const toggleChat = useCallback(() => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true)
      setActiveTab('chat')
    } else {
      setActiveTab((prev) =>
        prev === 'chat' ? (appointmentInfo?.isPsychologist ? 'record' : 'info') : 'chat'
      )
    }
  }, [isSidebarOpen, appointmentInfo?.isPsychologist])

  const leaveCall = useCallback(() => {
    if (!daily) return
    daily.leave().then(() => {
      window.location.href = '/sala/teste'
    })
  }, [daily])

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans relative">
      <div className="flex-1 relative flex flex-col items-center justify-between transition-all duration-300">
        <div className="absolute top-6 left-8 z-40 flex flex-col gap-1">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">
            MODO TESTE
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
            <div className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-md text-xs font-mono">
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-8 z-40 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase">
            SALA SEGURA (TESTE)
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-10 w-10 border transition-all text-white hover:bg-zinc-800 hover:text-white',
              isSidebarOpen
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            )}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <PanelRight className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={leaveCall}
            className="rounded-md font-bold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 h-10 px-4 transition-all border-none"
          >
            Encerrar
          </Button>
        </div>

        <div className="flex-1 w-full relative">
          <VideoStage />
        </div>

        <div className="w-full pb-8 pt-4 z-40">
          <RoomControls
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            isChatOpen={isSidebarOpen && activeTab === 'chat'}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
            onToggleChat={toggleChat}
          />
        </div>
      </div>

      <div
        className={cn(
          'transition-all duration-300 border-l border-zinc-800 flex relative h-full bg-zinc-900',
          isSidebarOpen ? 'w-[380px] xl:w-[420px]' : 'w-0 overflow-hidden border-none'
        )}
      >
        <RoomSidebar
          isPsychologist={appointmentInfo?.isPsychologist}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          appointmentId="mock_test"
        />
      </div>
    </div>
  )
}
