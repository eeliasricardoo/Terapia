'use client'

import { logger } from '@/lib/utils/logger'
import { useDaily, useLocalParticipant, useMediaTrack, useAudioLevel } from '@daily-co/daily-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  ShieldCheck,
  Loader2,
  Activity,
  User,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeviceSettings } from './DeviceSettings'
import { VideoTile } from './VideoTile'

interface PreJoinLobbyProps {
  roomUrl: string
  token: string
}

export function PreJoinLobby({ roomUrl, token }: PreJoinLobbyProps) {
  const daily = useDaily()
  const localParticipant = useLocalParticipant()
  const audioTrack = useMediaTrack(localParticipant?.session_id || '', 'audio')
  const videoTrack = useMediaTrack(localParticipant?.session_id || '', 'video')
  const [audioLevel, setAudioLevel] = useState(0)

  // Real audio tracking
  useAudioLevel(
    audioTrack.track,
    useCallback((level: number) => {
      setAudioLevel(level)
    }, [])
  )

  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Start preview when component mounts
  const hasStartedCamera = useRef(false)
  useEffect(() => {
    if (!daily || hasStartedCamera.current) return

    const startPreview = async () => {
      try {
        hasStartedCamera.current = true
        logger.debug('Starting camera preview with credentials...')

        daily.on('camera-error', (event: any) => {
          logger.error('Camera error:', event)
          setPreviewError(`Erro na câmera: ${event.error?.msg || 'Desconhecido'}`)
        })

        daily.on('error', (event: any) => {
          logger.error('Daily error:', event)
          setPreviewError(`Erro: ${event.errorMsg || 'Desconhecido'}`)
        })

        const state = daily.meetingState()
        if (state === 'new') {
          await daily.load({ url: roomUrl, token: token })
        }

        await daily.startCamera()
        setPreviewError(null)
      } catch (err: any) {
        logger.error('Failed to start camera preview', err)
        hasStartedCamera.current = false
        setPreviewError(err.message || 'Erro ao iniciar preview de câmera')
      }
    }

    startPreview()
  }, [daily, roomUrl, token])

  useEffect(() => {
    if (localParticipant) {
      if (localParticipant.audio !== isMicOn) setIsMicOn(localParticipant.audio)
      if (localParticipant.video !== isCamOn) setIsCamOn(localParticipant.video)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localParticipant?.audio, localParticipant?.video])

  const toggleMic = () => {
    if (!daily || daily.isDestroyed()) return
    const newState = !isMicOn
    daily.setLocalAudio(newState)
    setIsMicOn(newState)
  }

  const toggleCam = () => {
    if (!daily || daily.isDestroyed()) return
    const newState = !isCamOn
    daily.setLocalVideo(newState)
    setIsCamOn(newState)
  }

  const handleJoin = async () => {
    if (!daily || isJoining) return

    try {
      setIsJoining(true)
      await daily.join({ url: roomUrl, token: token })
      setPreviewError(null)
    } catch (err: any) {
      logger.error('Failed to join room', err)
      setPreviewError(`Erro ao entrar na sala: ${err.message}`)
      setIsJoining(false)
    }
  }

  const isCamBlocked = videoTrack.state === 'blocked'
  const isMicBlocked = audioTrack.state === 'blocked'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 animate-in fade-in duration-700 select-none">
      {previewError && (
        <div className="max-w-4xl w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold uppercase tracking-tight flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">!</div>
          {previewError}
        </div>
      )}

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-center">
        {/* Left: Preview */}
        <div className="space-y-8 flex flex-col items-center">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] uppercase font-extrabold tracking-widest text-zinc-950">
              <ShieldCheck className="h-3.5 w-3.5" />
              SALA SEGURA & ENCRIPTADA
            </div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tighter leading-none">
              Tudo pronto para começar?
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Verifique sua imagem e áudio antes de entrar na sessão.
            </p>
          </div>

          <div className="relative w-full max-w-2xl aspect-video bg-zinc-950 rounded-[32px] overflow-hidden shadow-2xl shadow-zinc-950/20 border-8 border-white ring-1 ring-zinc-100">
            {localParticipant ? (
              <VideoTile
                sessionId={localParticipant.session_id}
                isLocal
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-zinc-600 bg-zinc-900 gap-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Iniciando câmera...
                </p>
              </div>
            )}

            {/* Floating Device Status */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              {isMicOn && (
                <div className="flex items-center gap-0.5 h-6 px-2 bg-zinc-950/80 backdrop-blur-md rounded-lg border border-white/10">
                  {[0.4, 0.7, 0.5, 0.3].map((baseHeight, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-zinc-200 rounded-full transition-all duration-75"
                      style={{
                        height: `${(baseHeight + audioLevel * 0.5) * 100}%`,
                        opacity: audioLevel > 0.05 ? 1 : 0.4,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Control Bar Overlay */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-14 w-14 rounded-2xl shadow-xl transition-all active:scale-90',
                  isMicOn
                    ? 'bg-zinc-800/80 backdrop-blur-md text-white border border-white/20 hover:bg-zinc-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                )}
                onClick={toggleMic}
                disabled={isMicBlocked}
              >
                {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-14 w-14 rounded-2xl shadow-xl transition-all active:scale-90',
                  isCamOn
                    ? 'bg-zinc-800/80 backdrop-blur-md text-white border border-white/20 hover:bg-zinc-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                )}
                onClick={toggleCam}
                disabled={isCamBlocked}
              >
                {isCamOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </div>

            {/* Permission Warnings */}
            {(isCamBlocked || isMicBlocked) && (
              <div className="absolute top-4 left-4 right-4 bg-zinc-950 text-white text-[10px] py-1.5 px-4 rounded-xl text-center border border-white/20 font-bold uppercase tracking-widest animate-pulse">
                Atenção: Ative a{' '}
                {isCamBlocked && isMicBlocked
                  ? 'Câmera e Microfone'
                  : isCamBlocked
                    ? 'Câmera'
                    : 'Microfone'}{' '}
                nas configurações do navegador.
              </div>
            )}
          </div>
        </div>

        {/* Right: Join Card */}
        <div className="bg-zinc-50 p-10 rounded-[40px] border border-zinc-100 space-y-10 h-fit transition-all hover:bg-zinc-50/80">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-zinc-950 pb-2">
              <div className="flex items-center gap-2 font-black uppercase tracking-tighter text-sm">
                <Settings className="h-4 w-4 opacity-30" />
                Configurações
              </div>
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4">
              <DeviceSettings />
            </div>
          </div>

          <Separator className="bg-zinc-200" />

          <div className="space-y-6 pt-2">
            <Button
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-8 text-lg font-black rounded-3xl shadow-2xl shadow-zinc-950/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px] tracking-tight uppercase"
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Conectando...</span>
                </div>
              ) : (
                'Entrar na Sessão'
              )}
            </Button>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] text-center text-zinc-400 font-bold leading-relaxed uppercase tracking-widest px-4">
                Privacidade garantida sob padrões HIPAA & LGPD
              </p>
              <div className="flex gap-4 opacity-30">
                <ShieldCheck className="h-5 w-5" />
                <User className="h-5 w-5" />
                <Monitor className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
