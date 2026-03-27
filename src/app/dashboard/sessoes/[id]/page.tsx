'use client'

import React, { useEffect, useState, use } from 'react'
import { DailyProvider, DailyAudio, useMeetingState } from '@daily-co/daily-react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { Loader2, MonitorOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { PreJoinLobby } from '@/components/video/PreJoinLobby'
import { ActiveRoomInterface } from '@/components/video/ActiveRoomInterface'
import { SessionWindowGuard } from '@/components/dashboard/SessionWindowGuard'

interface RoomData {
  url: string
  token: string
  scheduledAt: string
  durationMinutes: number
  isPsychologist: boolean
}

export default function SessionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initRoom() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId: id }),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Falha ao acessar sala de vídeo')
        }

        const data = await res.json()
        setRoomData(data)

        // Setup Daily Call Object
        const existingCall = DailyIframe.getCallInstance()
        if (existingCall) {
          await existingCall.destroy()
        }

        const newCo = DailyIframe.createCallObject({
          subscribeToTracksAutomatically: true,
        })
        setCallObject(newCo)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    initRoom()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50/50 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="mt-6 text-slate-500 font-bold tracking-tight animate-pulse text-lg">
          Preparando sua sala digital...
        </p>
        <p className="text-slate-400 text-sm mt-2">Garantindo criptografia e conexão segura</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-lg w-full text-center">
          <div className="h-24 w-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Ops! Bloqueio de Acesso
          </h2>
          <p className="text-slate-600 mb-10 leading-relaxed font-medium">{error}</p>
          <div className="grid gap-4">
            <Button
              asChild
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <Link href="/dashboard/sessoes">Minhas Sessões</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-slate-500 hover:text-slate-900 font-bold py-6"
            >
              <Link href="/ajuda">Contatar Suporte</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!roomData || !callObject) return null

  return (
    <SessionWindowGuard
      scheduledAt={roomData.scheduledAt}
      durationMinutes={roomData.durationMinutes}
    >
      <DailyProvider callObject={callObject}>
        <RoomManager roomData={roomData} appointmentId={id} />
        <DailyAudio />
      </DailyProvider>
    </SessionWindowGuard>
  )
}

function RoomManager({ roomData, appointmentId }: { roomData: RoomData; appointmentId: string }) {
  const meetingState = useMeetingState()

  if (meetingState === 'joining-meeting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-6">
        <div className="relative">
          <div className="h-2 w-48 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
          <style jsx>{`
            @keyframes loading {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs">
          Estabelecendo Conexão P2P...
        </p>
      </div>
    )
  }

  if (meetingState === 'joined-meeting') {
    return (
      <ActiveRoomInterface
        appointmentId={appointmentId}
        appointmentInfo={{
          scheduledAt: roomData.scheduledAt,
          durationMinutes: roomData.durationMinutes,
          isPsychologist: roomData.isPsychologist,
        }}
      />
    )
  }

  return <PreJoinLobby roomUrl={roomData.url} token={roomData.token} />
}
