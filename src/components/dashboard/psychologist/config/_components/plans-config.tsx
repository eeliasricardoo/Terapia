'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit2, Trash2, Package, Sparkles } from 'lucide-react'
import type { Plan } from '../_hooks/use-services-config'

interface PlansConfigProps {
  plans: Plan[]
  onEdit: (plan: Plan) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export function PlansConfig({ plans, onEdit, onToggle, onDelete, onCreateNew }: PlansConfigProps) {
  if (plans.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Nenhum pacote criado</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Pacotes com múltiplas sessões aumentam a fidelização e garantem uma receita mais
            previsível.
          </p>
          <Button onClick={onCreateNew} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro pacote
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {plans.length} {plans.length === 1 ? 'pacote' : 'pacotes'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-500">
            {plans.filter((p) => p.active).length} ativo
            {plans.filter((p) => p.active).length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs px-3"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo pacote
        </Button>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
              plan.active
                ? 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                : 'border-slate-100 opacity-50'
            }`}
          >
            {/* Top accent line */}
            {plan.active && (
              <div className="h-1 w-full bg-gradient-to-r from-slate-700 to-slate-500" />
            )}

            <div className="p-5">
              {/* Badge + actions */}
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold bg-slate-100 text-slate-600 border-0"
                >
                  {plan.sessions} sessões
                </Badge>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onEdit(plan)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(plan.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Name */}
              <p className="font-semibold text-slate-900 text-sm mb-3 leading-tight">{plan.name}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
                {plan.discount > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />-{plan.discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                R$ {(plan.price / plan.sessions).toFixed(2)} por sessão
              </p>
            </div>

            {/* Footer toggle */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {plan.active ? 'Visível para pacientes' : 'Oculto'}
              </span>
              <Switch
                checked={plan.active}
                onCheckedChange={() => onToggle(plan.id)}
                className="scale-90 data-[state=checked]:bg-slate-800"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
