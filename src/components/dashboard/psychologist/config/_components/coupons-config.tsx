'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tag, Trash2, Percent, DollarSign } from 'lucide-react'
import type { Coupon } from '../_hooks/use-services-config'

interface CouponsConfigProps {
  coupons: Coupon[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export function CouponsConfig({ coupons, onToggle, onDelete, onCreateNew }: CouponsConfigProps) {
  if (coupons.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Tag className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Nenhum cupom criado</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Crie cupons de desconto para atrair novos pacientes ou recompensar os fiéis.
          </p>
          <Button onClick={onCreateNew} className="bg-slate-900 text-white hover:bg-slate-800">
            <Tag className="h-4 w-4 mr-2" />
            Criar primeiro cupom
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {coupons.length} {coupons.length === 1 ? 'cupom' : 'cupons'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-500">
            {coupons.filter((c) => c.active).length} ativo
            {coupons.filter((c) => c.active).length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs px-3"
        >
          <Tag className="h-3.5 w-3.5 mr-1.5" />
          Novo cupom
        </Button>
      </div>

      {/* Coupons list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
        {coupons.map((coupon) => {
          const usagePercent = coupon.maxUses
            ? Math.min(100, Math.round((coupon.used / coupon.maxUses) * 100))
            : null

          return (
            <div
              key={coupon.id}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                !coupon.active ? 'opacity-50' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Icon */}
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {coupon.type === 'percentage' ? (
                  <Percent className="h-4 w-4 text-slate-500" />
                ) : (
                  <DollarSign className="h-4 w-4 text-slate-500" />
                )}
              </div>

              {/* Code + discount */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono font-bold text-sm text-slate-900 tracking-widest">
                    {coupon.code}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold text-slate-600 border-slate-200 bg-slate-50 px-1.5 py-0"
                  >
                    {coupon.type === 'percentage'
                      ? `${coupon.value}% OFF`
                      : `R$ ${coupon.value.toFixed(2)} OFF`}
                  </Badge>
                </div>

                {/* Usage */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {coupon.used} uso{coupon.used !== 1 ? 's' : ''}
                    {coupon.maxUses ? ` de ${coupon.maxUses}` : ''}
                  </span>
                  {usagePercent !== null && (
                    <div className="flex-1 max-w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 90
                            ? 'bg-red-400'
                            : usagePercent >= 60
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={coupon.active}
                  onCheckedChange={() => onToggle(coupon.id)}
                  className="scale-90 data-[state=checked]:bg-slate-800"
                />
                <button
                  onClick={() => onDelete(coupon.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
