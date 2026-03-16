'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, Info, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyBenefitCardProps {
  currentCompany?: {
    name: string
    joinedAt: string
    status: string
  } | null
}

export function CompanyBenefitCard({ currentCompany }: CompanyBenefitCardProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleLink = async () => {
    if (!code) return
    setIsValidating(true)

    // Simulate API call
    setTimeout(() => {
      setIsValidating(false)
      if (code.toUpperCase() === 'MILANO-CARE-2024') {
        toast.success('Vínculo Confirmado! Você agora possui o benefício.')
      } else {
        toast.error('Código Inválido. Verifique com seu RH.')
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-8 pt-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-blue-600">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-outfit">Benefício Corporativo</CardTitle>
              <CardDescription className="font-medium">
                Vincule sua conta a uma empresa para obter subsídios em suas sessões.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          {currentCompany ? (
            <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-md border border-blue-50">
                  <span className="text-2xl font-black text-blue-600">
                    {currentCompany.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-slate-900">{currentCompany.name}</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold rounded-full text-[10px] uppercase">
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">
                    Vinculado em {currentCompany.joinedAt}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold px-6 border-2"
              >
                Remover Vínculo
              </Button>
            </div>
          ) : (
            <div className="max-w-xl space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <Input
                    placeholder="Insira seu código de convite único"
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-bold tracking-tight uppercase"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                  <Info className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    O código de convite é pessoal e intransferível. **Seu RH enviou este código para
                    seu e-mail corporativo.** Nenhum conteúdo das suas sessões será compartilhado
                    com a empresa.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLink}
                disabled={!code || isValidating}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl px-10 font-bold shadow-lg shadow-blue-600/20 text-lg gap-2"
              >
                {isValidating ? 'Validando...' : 'Ativar Benefício'}
                {!isValidating && <ArrowRight className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!currentCompany && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Sessões Subsidiadas',
              desc: 'Sua empresa paga parte ou o total das consultas.',
              icon: CheckCircle2,
              color: 'text-emerald-500',
            },
            {
              title: 'Sigilo Absoluto',
              desc: 'Privacidade total garantida por contrato e ética.',
              icon: ShieldCheck,
              color: 'text-blue-500',
            },
            {
              title: 'Fácil Ativação',
              desc: 'Basta um código para começar a economizar.',
              icon: Building2,
              color: 'text-indigo-500',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center space-y-3"
            >
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <h4 className="font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
