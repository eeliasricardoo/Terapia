'use client'

import { useState, useCallback } from 'react'
import {
  useMediaTrack,
  useParticipantProperty,
  DailyVideo,
  useAudioLevel,
} from '@daily-co/daily-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { MicOff, User, Activity } from 'lucide-react'

interface VideoTileProps {
  sessionId: string
  isLocal?: boolean
  className?: string
}

export function VideoTile({ sessionId, isLocal, className }: VideoTileProps) {
  const videoState = useMediaTrack(sessionId, 'video')
  const audioState = useMediaTrack(sessionId, 'audio')
  const userName = useParticipantProperty(sessionId, 'user_name')
  const [activeAudioLevel, setActiveAudioLevel] = useState(0)

  // Track real-time audio level for the participant
  useAudioLevel(
    audioState.track,
    useCallback((level: number) => {
      setActiveAudioLevel(level)
    }, [])
  )

  const isLoading = videoState.state === 'loading'
  const isOff =
    videoState.state === 'off' ||
    videoState.state === 'interrupted' ||
    videoState.state === 'blocked'

  const isSpeaking = activeAudioLevel > 0.1

  return (
    <div
      className={cn(
        'relative bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center transition-all ring-2',
        isSpeaking ? 'ring-zinc-200 z-10' : 'ring-transparent',
        className
      )}
    >
      <DailyVideo
        sessionId={sessionId}
        type="video"
        mirror={isLocal}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300 absolute inset-0',
          isLoading || isOff ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Fallback / Loading State */}
      {(isLoading || isOff) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 z-0 gap-4">
          <Avatar
            className={cn(
              'h-24 w-24 border-2 transition-all shadow-md',
              isSpeaking ? 'border-zinc-200' : 'border-zinc-700'
            )}
          >
            <AvatarFallback className="text-3xl font-bold bg-zinc-900 text-zinc-500">
              {userName ? (
                String(userName).slice(0, 2).toUpperCase()
              ) : (
                <User className="h-12 w-12" />
              )}
            </AvatarFallback>
          </Avatar>
          {videoState.state === 'blocked' && (
            <p className="text-[10px] text-zinc-100 bg-zinc-950 px-2 py-1 rounded uppercase font-bold tracking-tighter">
              Câmera Bloqueada
            </p>
          )}
          {isLoading && !isOff && (
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Iniciando...</p>
          )}
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-semibold tracking-tight">
            {userName || 'Aguardando...'} {isLocal && '(Você)'}
          </span>
          {isSpeaking && (
            <div className="flex items-center gap-0.5 h-2.5">
              {[0.4, 0.8, 0.5].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-zinc-200 rounded-full animate-bounce"
                  style={{
                    height: `${(h + activeAudioLevel * 0.4) * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {(audioState.state === 'off' || audioState.state === 'blocked') && (
          <div className="bg-zinc-950/80 p-1.5 rounded-md border border-zinc-800">
            <MicOff className="h-3 w-3 text-zinc-400" />
          </div>
        )}
      </div>
    </div>
  )
}
