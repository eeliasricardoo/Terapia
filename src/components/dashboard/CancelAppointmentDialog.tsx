'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cancelAppointment } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle } from 'lucide-react'

interface Props {
  appointmentId: string
  scheduledAt: string
  price: number
  isPsychologist?: boolean
  children?: React.ReactNode
}

export function CancelAppointmentDialog({
  appointmentId,
  scheduledAt,
  price,
  isPsychologist,
  children,
}: Props) {
  const t = useTranslations('Cancellation')
  const [reason, setReason] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const scheduledDate = new Date(scheduledAt)
  const now = new Date()
  const hoursDiff = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Refund policy: 100% if > 24h or if cancelled by psychologist
  const isRefundable = isPsychologist || hoursDiff >= 24
  const refundAmount = isRefundable ? price : 0

  async function handleCancel() {
    if (reason.trim().length < 5) {
      toast.error('Por favor, descreva o motivo do cancelamento (mínimo 5 caracteres).')
      return
    }

    setIsPending(true)
    try {
      const result = await cancelAppointment({ appointmentId, reason })

      if (result?.success) {
        toast.success(t('success'))
        setIsOpen(false)
        setReason('') // Reset for next use
      } else {
        toast.error(t('error'))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('error')
      toast.error(message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {t('cancelButton')}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[400px] rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-xl">{t('title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            {t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {!isRefundable && !isPsychologist && (
            <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <p className="font-medium leading-tight">{t('policyWarning')}</p>
            </div>
          )}

          {price > 0 && (
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {t('refundInfo', { amount: '' }).split(':')[0]}
              </span>
              <span className="text-lg font-black text-slate-900">
                {refundAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Label
              htmlFor="reason"
              className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1"
            >
              {t('reasonLabel')}
            </Label>
            <Textarea
              id="reason"
              placeholder={t('reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              className="resize-none rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/10 min-h-[100px]"
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-2xl border-slate-200 font-bold text-sm h-11"
          >
            {t('backButton')}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending || reason.trim().length < 5}
            className="rounded-2xl font-bold text-sm h-11 shadow-lg shadow-rose-200 bg-rose-600 hover:bg-rose-700 border-none transition-all active:scale-95"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('cancelButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
