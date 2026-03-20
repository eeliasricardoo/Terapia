'use client'
import { logger } from '@/lib/utils/logger'

import { useDaily, useLocalParticipant, useMediaTrack } from '@daily-co/daily-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Video, VideoOff, Settings, Sparkles } from 'lucide-react'
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

  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Start preview when component mounts
  const hasStartedCamera = useRef(false)
  useEffect(() => {
    if (!daily || hasStartedCamera.current) return

    const startPreview = async () => {
      try {
        hasStartedCamera.current = true
        setDebugInfo((prev) => [...prev, 'Iniciando preview...'])
        logger.debug('Starting camera preview with credentials...')

        // Add event listeners to debug what's happening
        daily.on('camera-error', (event: any) => {
          logger.error('Camera error:', event)
          setDebugInfo((prev) => [...prev, `Camera error: ${JSON.stringify(event)}`])
          setPreviewError(`Erro na câmera: ${event.error?.msg || 'Desconhecido'}`)
        })

        daily.on('error', (event: any) => {
          logger.error('Daily error:', event)
          setDebugInfo((prev) => [...prev, `Daily error: ${JSON.stringify(event)}`])
          setPreviewError(`Erro: ${event.errorMsg || 'Desconhecido'}`)
        })

        daily.on('started-camera', () => {
          logger.debug('Camera started event received')
          setDebugInfo((prev) => [...prev, 'Camera started!'])
        })

        setDebugInfo((prev) => [
          ...prev,
          `Joining room for preview: ${roomUrl.substring(0, 30)}...`,
        ])

        // Join the room directly (this creates the local participant and shows video)
        await daily.join({ url: roomUrl, token: token })

        setPreviewError(null)
        setDebugInfo((prev) => [...prev, 'Joined room successfully - preview ready!'])
        logger.debug('Camera preview started successfully')
      } catch (err: any) {
        logger.error('Failed to start camera preview', err)
        setDebugInfo((prev) => [...prev, `ERROR: ${err.message}`])
        hasStartedCamera.current = false
        setPreviewError(err.message || 'Erro ao iniciar preview de câmera')
      }
    }

    startPreview()

    // Event listeners will be cleaned up when the Daily instance is destroyed
  }, [daily, roomUrl, token])

  // Update local state if Daily changes it (e.g. via device menu)
  useEffect(() => {
    if (localParticipant) {
      if (localParticipant.audio !== isMicOn) setIsMicOn(localParticipant.audio)
      if (localParticipant.video !== isCamOn) setIsCamOn(localParticipant.video)
    }
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

    setIsJoining(true)

    // User is already in the room from preview, so we just need to
    // signal that they're "officially" joining (no action needed)
    // The parent component will transition based on meeting state
    logger.debug('User confirmed join - already in room')
  }

  const isCamBlocked = videoTrack.state === 'blocked'
  const isMicBlocked = audioTrack.state === 'blocked'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 animate-in fade-in zoom-in duration-500">
      {previewError && (
        <div className="max-w-4xl w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Erro no preview:</strong> {previewError}
        </div>
      )}
      {debugInfo.length > 0 && (
        <div className="max-w-4xl w-full mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono">
          <strong className="text-blue-900 block mb-2">Debug Log:</strong>
          {debugInfo.map((info, i) => (
            <div key={i} className="text-blue-700">
              {info}
            </div>
          ))}
        </div>
      )}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Preview */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="flex flex-col items-center text-center space-y-2 mb-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 gap-1 px-3 py-1"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sala de Espera
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Prepare-se para entrar
            </h1>
            <p className="text-slate-500">Verifique sua câmera e microfone antes da sessão.</p>
          </div>

          <div className="relative w-full max-w-md aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white">
            {localParticipant ? (
              <VideoTile
                sessionId={localParticipant.session_id}
                isLocal
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-slate-500 bg-slate-900">
                <p>Carregando preview...</p>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4 z-20">
              <Button
                variant={isMicBlocked ? 'outline' : isMicOn ? 'secondary' : 'destructive'}
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg border-2 border-transparent hover:border-white/20',
                  isMicBlocked && 'border-red-500'
                )}
                onClick={toggleMic}
                disabled={isMicBlocked}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                variant={isCamBlocked ? 'outline' : isCamOn ? 'secondary' : 'destructive'}
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg border-2 border-transparent hover:border-white/20',
                  isCamBlocked && 'border-red-500'
                )}
                onClick={toggleCam}
                disabled={isCamBlocked}
              >
                {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </div>

            {(isCamBlocked || isMicBlocked) && (
              <div className="absolute top-4 left-4 right-4 bg-red-600/90 text-white text-[10px] py-1 px-3 rounded-full text-center backdrop-blur-sm animate-bounce">
                Por favor, permita o acesso à{' '}
                {isCamBlocked && isMicBlocked
                  ? 'câmera e microfone'
                  : isCamBlocked
                    ? 'câmera'
                    : 'microfone'}{' '}
                no navegador.
              </div>
            )}
          </div>

          {/* Audio Level Meter */}
          <div className="w-full max-w-md bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                'h-full bg-green-500 transition-all duration-150',
                isMicOn ? 'opacity-50 animate-pulse w-1/2' : 'w-0'
              )}
            ></div>
          </div>
        </div>

        {/* Right: Settings & Join */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8 h-fit">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Configurações de Dispositivos
            </div>

            <DeviceSettings />
          </div>

          <Separator />

          <div className="space-y-4 pt-2">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                ✓ Conectado! Ajuste seus dispositivos se necessário.
              </p>
              <p className="text-xs text-center text-blue-600 mt-2">
                Você já está na sala. A chamada começará automaticamente.
              </p>
            </div>
            <p className="text-xs text-center text-slate-400">
              Ao permanecer na sala, você concorda com nossos termos de telemedicina e gravação de
              sessão.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
