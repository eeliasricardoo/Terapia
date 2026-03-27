'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDaily, useParticipantIds, useLocalParticipant } from '@daily-co/daily-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PanelRight, LogOut, Video } from 'lucide-react'

import { RoomControls } from '@/components/video/RoomControls'
import { VideoStage } from '@/components/video/VideoStage'
import { RoomSidebar } from '@/components/video/RoomSidebar'
import { useRoomTimer } from '@/hooks/useRoomTimer'

export interface ActiveRoomInterfaceProps {
  appointmentId: string
  appointmentInfo: {
    scheduledAt: string
    durationMinutes: number
    isPsychologist: boolean
    patientName?: string
    psychologistName?: string
  }
}

export function ActiveRoomInterface({ appointmentId, appointmentInfo }: ActiveRoomInterfaceProps) {
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
    const mins = Math.max(0, Math.floor(seconds / 60))
    const secs = Math.max(0, Math.floor(seconds % 60))
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
    if (window.confirm('Deseja realmente sair da sessão?')) {
      daily.leave().then(() => {
        router.push('/dashboard/sessoes')
      })
    }
  }, [daily, router])

  return (
    <div className="fixed inset-0 z-50 flex h-screen bg-zinc-950 overflow-hidden font-sans">
      {/* Main Content: Full Video Area */}
      <div className="flex-1 relative flex flex-col items-center justify-between transition-all duration-300">
        {/* Top Bar / Header */}
        <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start pointer-events-none">
          {/* Session Info */}
          <div className="pointer-events-auto flex flex-col gap-2 bg-zinc-950/40 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/50 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                Sessão em Andamento
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all tabular-nums shadow-inner',
                  remainingSeconds <= 300 && remainingSeconds > 0
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-zinc-900/80 text-emerald-400 border border-emerald-500/20'
                )}
              >
                {formatTime(remainingSeconds)}
              </div>
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold leading-tight">
                  {appointmentInfo.isPsychologist
                    ? appointmentInfo.patientName
                    : appointmentInfo.psychologistName}
                </span>
                <span className="text-zinc-500 text-[10px] leading-tight">Terapia Individual</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pointer-events-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-12 w-12 rounded-2xl border-2 transition-all shadow-xl backdrop-blur-md',
                isSidebarOpen
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-900 hover:bg-white'
                  : 'bg-zinc-900/60 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <PanelRight className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              onClick={leaveCall}
              className="h-12 px-6 rounded-2xl bg-red-500/90 hover:bg-red-600 text-white font-bold shadow-xl shadow-red-500/20 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex gap-2"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>

        {/* Video Canvas Area */}
        <div className="flex-1 w-full relative">
          <VideoStage />
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-auto px-6 py-4 bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
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

      {/* Sidebar Interface */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out border-l border-zinc-800/50 flex relative h-full bg-zinc-950/80 backdrop-blur-xl',
          isSidebarOpen ? 'w-[400px] xl:w-[460px]' : 'w-0 overflow-hidden border-none opacity-0'
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
