'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, FileText, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cancelSession } from '@/lib/actions/sessions'
import { useRouter } from 'next/navigation'

interface SessionDetailsDialogProps {
  children: React.ReactNode
  session: {
    id: string
    type: string
    scheduledAt: string
    durationMinutes: number
    psychologist: {
      name: string
      specialty: string
      image?: string
    }
  }
}

export function SessionDetailsDialog({ children, session }: SessionDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const router = useRouter()

  const handleCancelSession = async () => {
    setIsCanceling(true)
    try {
      const result = await cancelSession(session.id)

      if (result.success) {
        toast.success('Sessão cancelada com sucesso', {
          description: 'O profissional será notificado sobre o cancelamento.',
          duration: 4000,
        })
        setOpen(false)
        router.refresh()
      } else {
        toast.error('Erro ao cancelar sessão', {
          description: result.error || 'Tente novamente mais tarde.',
          duration: 4000,
        })
      }
    } catch {
      toast.error('Erro ao cancelar sessão', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        duration: 4000,
      })
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Sessão</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Type */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tipo de Sessão</h3>
            <p className="text-lg font-semibold">{session.type}</p>
            <Badge variant="secondary" className="mt-2">
              Próxima Sessão
            </Badge>
          </div>

          <Separator />

          {/* Professional Info */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Profissional</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-blue-100">
                <AvatarImage src={session.psychologist.image || undefined} />
                <AvatarFallback>{session.psychologist.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{session.psychologist.name}</p>
                <p className="text-sm text-muted-foreground">{session.psychologist.specialty}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data
              </h3>
              <p className="font-medium">
                {new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(new Date(session.scheduledAt))}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </h3>
              <p className="font-medium">
                {new Intl.DateTimeFormat('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(session.scheduledAt))}{' '}
                -{' '}
                {new Intl.DateTimeFormat('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(
                  new Date(
                    new Date(session.scheduledAt).getTime() + session.durationMinutes * 60000
                  )
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Video className="h-4 w-4" />
              Formato
            </h3>
            <p className="font-medium">Videochamada Online</p>
            <p className="text-sm text-muted-foreground mt-1">
              O link da sala estará disponível 5 minutos antes do horário
            </p>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </h3>
            <p className="text-sm text-muted-foreground">
              Certifique-se de estar em um ambiente tranquilo e com boa conexão de internet.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1" disabled={isCanceling}>
                  {isCanceling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    'Cancelar Sessão'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A sessão agendada será cancelada e o
                    profissional será notificado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSession}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Cancelando...' : 'Sim, cancelar sessão'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
