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

import { linkCompanyBenefit, unlinkCompanyBenefit } from '@/lib/actions/company'

interface CompanyBenefitCardProps {
  currentCompany?: {
    id: string
    name: string
    joinedAt: string
    status: string
  } | null
}

export function CompanyBenefitCard({ currentCompany }: CompanyBenefitCardProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLink = async () => {
    if (!code) return
    setIsValidating(true)

    try {
      const result = await linkCompanyBenefit(code)
      if (result.success) {
        toast.success('Vínculo Confirmado! Você agora possui o benefício.')
        setCode('')
      } else {
        toast.error('Código Inválido', { description: result.error })
      }
    } catch (err) {
      toast.error('Erro ao processar solicitação')
    } finally {
      setIsValidating(false)
    }
  }

  const handleUnlink = async () => {
    if (!currentCompany?.id) return

    setIsLoading(true)
    try {
      const result = await unlinkCompanyBenefit(currentCompany.id)
      if (result.success) {
        toast.success('Vínculo removido com sucesso.')
      } else {
        toast.error('Erro ao remover vínculo', { description: result.error })
      }
    } catch (err) {
      toast.error('Erro ao processar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

        <div className="relative space-y-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200 text-white shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Benefício Corporativo
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Vincule sua conta a uma empresa para obter subsídios em suas sessões de terapia.
              </p>
            </div>
          </div>

          {currentCompany ? (
            <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:bg-slate-50">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-[1.5rem] bg-white flex items-center justify-center shadow-lg border border-slate-100">
                  <span className="text-3xl font-bold text-slate-900">
                    {currentCompany.name.charAt(0)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-900 leading-none">
                      {currentCompany.name}
                    </h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Ativo</span>
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">
                    Vinculado em {currentCompany.joinedAt}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-bold px-8 transition-all active:scale-95"
                onClick={handleUnlink}
                disabled={isLoading}
              >
                {isLoading ? 'Removendo...' : 'Remover Vínculo'}
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    <ShieldCheck />
                  </div>
                  <Input
                    placeholder="INSERIR SEU CÓDIGO DE CONVITE ÚNICO"
                    className="pl-14 h-16 rounded-3xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 text-base font-bold tracking-[0.1em] placeholder:text-slate-300 transition-all shadow-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    O código de convite é pessoal e fornecido pelo RH da sua empresa.
                    <span className="block mt-1 text-slate-400 italic">
                      Sua privacidade é garantida: nenhum conteúdo das sessões é compartilhado.
                    </span>
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLink}
                disabled={!code || isValidating}
                className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 h-16 rounded-3xl px-12 font-bold shadow-2xl shadow-slate-200 text-sm uppercase tracking-widest gap-3 transition-all active:scale-95 disabled:opacity-20 translate-y-2 hover:translate-y-0"
              >
                {isValidating ? 'Validando...' : 'Ativar Benefício'}
                {!isValidating && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!currentCompany && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          {[
            {
              title: 'Subsubsídios',
              desc: 'Sua empresa paga parte ou o total das suas consultas.',
              icon: CheckCircle2,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
            },
            {
              title: 'Sigilo Total',
              desc: 'Nenhuma informação sensível é enviada para a empresa.',
              icon: ShieldCheck,
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              title: 'Simples e Rápido',
              desc: 'Ative em segundos com seu código corporativo.',
              icon: Building2,
              color: 'text-slate-900',
              bg: 'bg-slate-50',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className={`h-14 w-14 ${item.bg} rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
