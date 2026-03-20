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

  if (isLoading) {
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

  // Sync state if it changed in lobby or via Daily events
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

  const toggleMic = useCallback(() => {
    if (!daily || daily.isDestroyed()) return
    daily.setLocalAudio(!isMicOn)
    setIsMicOn(!isMicOn)
  }, [daily, isMicOn])

  const toggleCam = useCallback(() => {
    if (!daily || daily.isDestroyed()) return
    daily.setLocalVideo(!isCamOn)
    setIsCamOn(!isCamOn)
  }, [daily, isCamOn])

  const leaveCall = useCallback(() => {
    if (!daily) return
    daily.leave().then(() => {
      router.push('/dashboard')
    })
  }, [daily, router])

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <RoomHeader
        remainingSeconds={remainingSeconds}
        remoteParticipantCount={remoteParticipantIds.length}
        onLeave={leaveCall}
      />

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Area (65%) */}
        <div className="flex-[2] bg-slate-900 p-4 relative flex flex-col items-center justify-center gap-4">
          {/* Main Stage and Local User */}
          <VideoStage />

          {/* Controls Bar */}
          <RoomControls
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
          />
        </div>

        {/* Right: Tools/Records Area (35%) */}
        <RoomSidebar isPsychologist={appointmentInfo?.isPsychologist} />
      </div>

      {/* Invisible Handles for Daily Audio handled globally */}
    </div>
  )
}
