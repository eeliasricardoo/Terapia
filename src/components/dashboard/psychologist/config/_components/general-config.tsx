'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Check,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Info,
  CalendarDays,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface GeneralConfigProps {
  sessionPrice: string
  setSessionPrice: (val: string) => void
  sessionDuration: string
  setSessionDuration: (val: string) => void
  averagePlatformPrice: string | null
  monthlyPlanEnabled: boolean
  setMonthlyPlanEnabled: (val: boolean) => void
  monthlyPlanSessions: number
  setMonthlyPlanSessions: (val: number) => void
  monthlyPlanDiscount: number
  setMonthlyPlanDiscount: (val: number) => void
  isSaving: boolean
  onSave: () => void
}

export function GeneralConfig({
  sessionPrice,
  setSessionPrice,
  sessionDuration,
  setSessionDuration,
  averagePlatformPrice,
  monthlyPlanEnabled,
  setMonthlyPlanEnabled,
  monthlyPlanSessions,
  setMonthlyPlanSessions,
  monthlyPlanDiscount,
  setMonthlyPlanDiscount,
  isSaving,
  onSave,
}: GeneralConfigProps) {
  const priceNum = parseFloat(sessionPrice)
  const avgNum = averagePlatformPrice ? parseFloat(averagePlatformPrice) : null
  const diff = avgNum && priceNum ? Math.round(((priceNum - avgNum) / avgNum) * 100) : null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Sessão Avulsa</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Valor cobrado por sessão individual — exibido no seu perfil público.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Valor da sessão</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                R$
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(e.target.value)}
                placeholder="0,00"
                className="pl-10 h-11 text-base font-semibold bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            {avgNum && diff !== null && (
              <div className="flex items-center gap-1.5 text-xs">
                {diff > 5 ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-amber-600 font-medium">{diff}% acima da média</span>
                  </>
                ) : diff < -5 ? (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-blue-600 font-medium">
                      {Math.abs(diff)}% abaixo da média
                    </span>
                  </>
                ) : (
                  <>
                    <Minus className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Na média da plataforma</span>
                  </>
                )}
                <span className="text-slate-400">
                  · média R$ {avgNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Duração</Label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Selecione" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="50">50 minutos (padrão)</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live preview */}
        {priceNum > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              Preview para o paciente
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Sessão de Terapia Individual</p>
                <p className="text-xs text-slate-400 mt-0.5">{sessionDuration} min · Online</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  R$ {priceNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400">por sessão</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Plan */}
      <div className="px-6 py-5 border-t border-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Plano Mensal</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ofereça um desconto para pacientes que contratam sessões mensais.
              </p>
            </div>
          </div>
          <Switch
            checked={monthlyPlanEnabled}
            onCheckedChange={setMonthlyPlanEnabled}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        {monthlyPlanEnabled && (
          <div className="grid grid-cols-2 gap-4 pl-12">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Sessões por mês</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={monthlyPlanSessions}
                onChange={(e) => setMonthlyPlanSessions(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-11 bg-slate-50 border-slate-200 font-semibold focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Desconto (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="80"
                  value={monthlyPlanDiscount}
                  onChange={(e) =>
                    setMonthlyPlanDiscount(Math.min(80, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="h-11 bg-slate-50 border-slate-200 font-semibold focus:bg-white pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  %
                </span>
              </div>
            </div>

            {priceNum > 0 && (
              <div className="col-span-2 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  Preview para o paciente
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Plano Mensal</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {monthlyPlanSessions} sessões · {monthlyPlanDiscount}% de desconto
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-700">
                      R${' '}
                      {(priceNum * (1 - monthlyPlanDiscount / 100)).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-slate-400">por sessão</p>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      Total: R${' '}
                      {(
                        priceNum *
                        (1 - monthlyPlanDiscount / 100) *
                        monthlyPlanSessions
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      /mês
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
        <Button
          onClick={onSave}
          disabled={isSaving || !sessionPrice}
          className="bg-slate-900 text-white hover:bg-slate-800 px-5"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
