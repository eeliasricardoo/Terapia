'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GuestBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  psychologistName: string
  selectedDate: string
  selectedTime: string
  bookingUrl: string
}

export function GuestBookingDialog({
  isOpen,
  onClose,
  psychologistName,
  selectedDate,
  selectedTime,
  bookingUrl,
}: GuestBookingDialogProps) {
  const router = useRouter()

  const handleAction = (type: 'register' | 'login') => {
    const returnTo = encodeURIComponent(bookingUrl)
    const path = type === 'register' ? '/cadastro/paciente' : '/login/paciente'
    router.push(`${path}?returnTo=${returnTo}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

          <DialogHeader className="relative z-10 text-left">
            <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md mb-4">
              <UserCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-primary-foreground mb-2">
              Quase lá! Vamos garantir seu horário.
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/75 text-base font-medium leading-relaxed">
              Você selecionou um horário excelente com {psychologistName}. Crie sua conta para
              confirmar e seguir para o pagamento.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8 bg-white">
          <div className="bg-muted/40 rounded-3xl p-6 border border-border space-y-4">
            <div className="flex items-center gap-4 text-foreground">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-border">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">
                  Data
                </p>
                <p className="text-sm font-bold">{selectedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-foreground">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-border">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">
                  Horário
                </p>
                <p className="text-sm font-bold">{selectedTime}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleAction('register')}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleAction('login')}
              className="w-full h-12 text-muted-foreground font-bold hover:bg-muted/50 hover:text-foreground rounded-xl"
            >
              Já tenho uma conta
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Seus dados são protegidos e o sigilo é garantido
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
