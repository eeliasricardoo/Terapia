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
  useAudioLevel,
} from '@daily-co/daily-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { VideoOff, Loader2 } from 'lucide-react'

import { PreJoinLobby } from '@/components/video/PreJoinLobby'
import { RoomHeader } from '@/components/video/RoomHeader'
import { RoomControls } from '@/components/video/RoomControls'
import { VideoStage } from '@/components/video/VideoStage'
import { RoomSidebar } from '@/components/video/RoomSidebar'
import { useRoomTimer } from '@/hooks/useRoomTimer'
import { useRoomConnection, AppointmentInfo } from '@/hooks/useRoomConnection'

export default function VideoRoomPage({ params }: { params: { id: string } }) {
  const { appointmentInfo, error, isLoading, callObject, roomUrl, token } = useRoomConnection(
    params.id
  )

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
            <p className="text-red-500 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 flex-1"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => (window.location.href = '/dashboard')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !callObject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 animate-pulse">Preparando sala de atendimento...</p>
      </div>
    )
  }

  return (
    <DailyProvider callObject={callObject}>
      <RoomManager
        appointmentId={params.id}
        appointmentInfo={appointmentInfo!}
        roomUrl={roomUrl!}
        token={token!}
      />
      <DailyAudio />
    </DailyProvider>
  )
}

function RoomManager({
  appointmentId,
  appointmentInfo,
  roomUrl,
  token,
}: {
  appointmentId: string
  appointmentInfo: AppointmentInfo
  roomUrl: string
  token: string
}) {
  const meetingState = useMeetingState()

  // Transition states
  if (meetingState === 'joining-meeting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400">Entrando na sala...</p>
      </div>
    )
  }

  if (meetingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <p className="text-red-500 font-semibold mb-2">Erro na conexão de vídeo</p>
        <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
      </div>
    )
  }

  // Only show Active Room if fully joined
  if (meetingState === 'joined-meeting') {
    return <ActiveRoomInterface appointmentId={appointmentId} appointmentInfo={appointmentInfo} />
  }

  return <PreJoinLobby roomUrl={roomUrl} token={token} />
}

import { PanelRight, PhoneOff, Clock, ShieldCheck } from 'lucide-react'

function ActiveRoomInterface({
  appointmentId,
  appointmentInfo,
}: {
  appointmentId: string
  appointmentInfo: AppointmentInfo
}) {
  const daily = useDaily()
  const router = useRouter()
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })
  const localParticipant = useLocalParticipant()

  const [isMicOn, setIsMicOn] = useState(localParticipant?.audio ?? true)
  const [isCamOn, setIsCamOn] = useState(localParticipant?.video ?? true)
  const [activeTab, setActiveTab] = useState(appointmentInfo?.isPsychologist ? 'record' : 'chat')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Sync state if it changed in lobby or via Daily events
  useEffect(() => {
    if (localParticipant) {
      if (localParticipant.audio !== isMicOn) setIsMicOn(localParticipant.audio)
      if (localParticipant.video !== isCamOn) setIsCamOn(localParticipant.video)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        prev === 'chat' ? (appointmentInfo?.isPsychologist ? 'record' : 'chat') : 'chat'
      )
    }
  }, [isSidebarOpen, appointmentInfo?.isPsychologist])

  const leaveCall = useCallback(() => {
    if (!daily) return
    daily.leave().then(() => {
      router.push('/dashboard')
    })
  }, [daily, router])

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans relative">
      {/* Main Content: Full Video Area */}
      <div className="flex-1 relative flex flex-col items-center justify-between transition-all duration-300">
        {/* Floating Session Info - Top Left */}
        <div className="absolute top-6 left-8 z-40 flex flex-col gap-1">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">
            Sessão em andamento
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
            <div
              className={cn(
                'px-3 py-1 rounded-md text-xs font-mono transition-all',
                remainingSeconds <= 300
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              )}
            >
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Floating Actions - Top Right */}
        <div className="absolute top-6 right-8 z-40 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase">
            SALA SEGURA
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-10 w-10 border transition-all',
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
            className="rounded-md font-bold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 h-10 px-4 transition-all"
          >
            Encerrar
          </Button>
        </div>

        {/* Full Image Stage */}
        <div className="flex-1 w-full relative">
          <VideoStage />
        </div>

        {/* Controls Bar */}
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

      {/* Toggleable Sidebar */}
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
          appointmentId={appointmentId}
        />
      </div>
    </div>
  )
}
