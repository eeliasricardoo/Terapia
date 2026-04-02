'use client'

import { Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PatientDashboardHeaderProps {
  userName: string
  nextSession: {
    id: string
    type: string
    scheduledAt: string
    durationMinutes: number
    psychologist: {
      name: string
      specialty: string
      image?: string
    }
  } | null
}

export function PatientDashboardHeader({ userName, nextSession }: PatientDashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, {userName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo de volta ao seu espaço de cuidado.</p>
      </div>
      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 px-6">
              <Video className="h-4 w-4" />
              Iniciar Sessão Agora
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sala de Espera Virtual</DialogTitle>
              <DialogDescription>
                {nextSession ? (
                  <>
                    Sua sessão com {nextSession.psychologist.name} está agendada para{' '}
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                    }).format(new Date(nextSession.scheduledAt))}{' '}
                    às{' '}
                    {new Intl.DateTimeFormat('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(nextSession.scheduledAt))}
                    .
                  </>
                ) : (
                  <>Você não tem nenhuma sessão agendada no momento.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-6">
              <div className="text-center space-y-4">
                <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Video className="h-10 w-10" />
                </div>
                <p className="text-sm text-muted-foreground">
                  O link para a videochamada estará disponível 5 minutos antes.
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="button" variant="secondary" className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
