'use client'

import { useState } from 'react'
import {
  DailyProvider,
  DailyAudio,
  useMeetingState,
} from '@daily-co/daily-react'
import { Loader2, Video, Terminal } from 'lucide-react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PreJoinLobby } from '@/components/video/PreJoinLobby'
import { ActiveRoomInterface } from './_components/ActiveRoomInterface'

export default function VideoTestPage() {
  const [roomData, setRoomData] = useState<{ url: string; token: string; appointmentInfo: any } | null>(null)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTest = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/video/test', { method: 'POST' })
      if (!res.ok) throw new Error('Falha ao iniciar teste de vídeo')
      
      const data = await res.json()
      setRoomData({
        url: data.url,
        token: data.token,
        appointmentInfo: {
          scheduledAt: data.scheduledAt,
          durationMinutes: data.durationMinutes,
          isPsychologist: data.isPsychologist,
        }
      })

      // Setup call object like in useRoomConnection
      const existingCall = DailyIframe.getCallInstance()
      if (existingCall) {
        await existingCall.destroy()
      }
      const newCo = DailyIframe.createCallObject()
      setCallObject(newCo)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (roomData && callObject) {
    return (
      <DailyProvider callObject={callObject}>
        <RoomManager 
          roomUrl={roomData.url} 
          token={roomData.token} 
          appointmentInfo={roomData.appointmentInfo} 
        />
        <DailyAudio />
      </DailyProvider>
    )
  }

  return (
    <div className="container mx-auto py-12 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full border-zinc-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-zinc-900" />
          </div>
          <CardTitle className="text-2xl">Teste de Vídeo Chamada</CardTitle>
          <CardDescription>
            Use esta página para testar sua câmera, microfone e a interface da sala de atendimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md flex items-center gap-2">
              <Terminal className="h-4 w-4" /> {error}
            </div>
          )}
          
          <Button 
            className="w-full h-12 text-lg font-medium" 
            onClick={startTest}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando sala de teste...
              </>
            ) : (
              'Iniciar Teste Agora'
            )}
          </Button>

          <p className="text-xs text-zinc-500 text-center">
            Uma sala temporária será criada no Daily.co para o seu teste.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function RoomManager({
    roomUrl,
    token,
    appointmentInfo,
  }: {
    roomUrl: string
    token: string
    appointmentInfo: any
  }) {
    const meetingState = useMeetingState()
  
    if (meetingState === 'joining-meeting') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-slate-400">Entrando na sala de teste...</p>
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
  
    if (meetingState === 'joined-meeting') {
      return <ActiveRoomInterface appointmentId="test-id" appointmentInfo={appointmentInfo} />
    }
  
    return <PreJoinLobby roomUrl={roomUrl} token={token} />
  }
