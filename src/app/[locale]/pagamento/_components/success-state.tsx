'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SuccessStateProps {
  doctorName: string
  date: string | null
  time: string | null
  psychTimezone: string
  matchedInsuranceName?: string | null
}

export function SuccessState({
  doctorName,
  date,
  time,
  psychTimezone,
  matchedInsuranceName,
}: SuccessStateProps) {
  const transactionId = matchedInsuranceName
    ? `INS-${matchedInsuranceName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`
    : `PAY-${Math.floor(Math.random() * 1000000)}`

  const formattedDate = date
    ? (() => {
        const [year, month, day] = date.split('-')
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return `${day} de ${d.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())}, ${year}`
      })()
    : '15 de Outubro, 2024'

  const formattedTime = `às ${time || '09:00'} ${psychTimezone && `(${psychTimezone.split('/')[1]?.replace('_', ' ')})`}`

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Check className="h-12 w-12 text-blue-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        {matchedInsuranceName
          ? 'Sessão agendada pelo seu plano!'
          : 'Pagamento confirmado e sessão agendada!'}
      </h1>
      <p className="text-slate-600 mb-8">
        Te enviamos um e-mail com todos os detalhes da sua sessão.
      </p>

      <Card className="w-full bg-white border-none shadow-md mb-8 text-left overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Profissional
              </p>
              <p className="font-bold text-lg text-slate-900">{doctorName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">
                Data e Hora
              </p>
              <p className="font-medium text-slate-900">
                {formattedDate}
                <br />
                <span className="text-slate-600">{formattedTime}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">
                {matchedInsuranceName ? 'Protocolo' : 'ID da Transação'}
              </p>
              <p className="font-font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit text-sm">
                {transactionId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 w-full">
        <Button
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-md"
          onClick={() => (window.location.href = '/dashboard/sessoes')}
        >
          Ver detalhes da sessão
        </Button>
        <Button
          variant="ghost"
          className="w-full text-slate-600 hover:bg-slate-100"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Ir para meu painel
        </Button>
      </div>
      <p className="text-sm text-slate-400 mt-8">
        Se tiver alguma dúvida, não hesite em{' '}
        <a href="/dashboard/suporte" className="underline hover:text-blue-600">
          contatar o suporte
        </a>
        .
      </p>
    </div>
  )
}
