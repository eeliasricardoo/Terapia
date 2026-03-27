'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDaily, useParticipantIds, useLocalParticipant } from '@daily-co/daily-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PanelRight } from 'lucide-react'

import { RoomControls } from '@/components/video/RoomControls'
import { VideoStage } from '@/components/video/VideoStage'
import { RoomSidebar } from '@/components/video/RoomSidebar'
import { useRoomTimer } from '@/hooks/useRoomTimer'

export function ActiveRoomInterface({
  appointmentId,
  appointmentInfo,
}: {
  appointmentId: string
  appointmentInfo: {
    scheduledAt: string
    durationMinutes: number
    isPsychologist: boolean
  }
}) {
  const daily = useDaily()
  const router = useRouter()
  const localParticipant = useLocalParticipant()

  const [isMicOn, setIsMicOn] = useState(localParticipant?.audio ?? true)
  const [isCamOn, setIsCamOn] = useState(localParticipant?.video ?? true)
  const [activeTab, setActiveTab] = useState(appointmentInfo?.isPsychologist ? 'record' : 'info')
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
        prev === 'chat' ? (appointmentInfo?.isPsychologist ? 'record' : 'info') : 'chat'
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
    <div className="fixed inset-0 z-50 flex h-screen bg-zinc-950 overflow-hidden font-sans relative">
      {/* Main Content: Full Video Area */}
      <div className="flex-1 relative flex flex-col items-center justify-between transition-all duration-300">
        {/* Floating Session Info - Top Left */}
        <div className="absolute top-6 left-8 z-40 flex flex-col gap-1">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">
            Teste de Sessão
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
            SALA DE TESTE
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
            Sair do Teste
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
