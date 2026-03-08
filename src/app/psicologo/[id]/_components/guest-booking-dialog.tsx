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
import { cn } from '@/lib/utils'

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
    // Encoda a URL de retorno para que o usuário volte para o agendamento após o login/cadastro
    const returnTo = encodeURIComponent(bookingUrl)
    const path = type === 'register' ? '/cadastro/paciente' : '/login/paciente'
    router.push(`${path}?returnTo=${returnTo}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <DialogHeader className="relative z-10 text-left">
            <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md mb-4">
              <UserCheck className="h-6 w-6 text-blue-50" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white mb-2">
              Quase lá! Vamos garantir seu horário.
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-base font-medium leading-relaxed">
              Você selecionou um horário excelente com {psychologistName}. Crie sua conta para
              confirmar e seguir para o pagamento.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8 bg-white">
          {/* Booking Summary Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-4 text-slate-700">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">
                  Data
                </p>
                <p className="text-sm font-bold">{selectedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-700">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">
                  Horário
                </p>
                <p className="text-sm font-bold">{selectedTime}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleAction('register')}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleAction('login')}
              className="w-full h-12 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 rounded-xl"
            >
              Já tenho uma conta
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Seus dados são protegidos e o sigilo é garantido
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
