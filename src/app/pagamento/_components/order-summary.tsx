'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OrderSummaryProps {
  doctorName: string
  date: string | null
  time: string | null
  price: string
  psychTimezone: string
  couponCode: string
  setCouponCode: (code: string) => void
  onApplyCoupon: () => void
  isValidatingCoupon: boolean
  appliedCoupon: { code: string; type: string; value: number } | null
  discountAmount: number
  finalPrice: string
}

export function OrderSummary({
  doctorName,
  date,
  time,
  price,
  psychTimezone,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  isValidatingCoupon,
  appliedCoupon,
  discountAmount,
  finalPrice,
}: OrderSummaryProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-slate-900">Resumo da sua compra</h2>
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-6 text-slate-900">Sessão de Terapia Individual</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Profissional:</span>
              <span className="font-medium text-slate-900">{doctorName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Data e Hora:</span>
              <span className="font-medium text-slate-900">
                {date || '15 de Outubro, 2024'} às {time || '09:00'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Fuso Horário:</span>
              <span className="font-medium text-slate-900">
                {psychTimezone.split('/')[1]?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Duração:</span>
              <span className="font-medium text-slate-900">50 minutos</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full" />
              Possui um cupom?
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: TERAPIA20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={!!appliedCoupon || isValidatingCoupon}
              />
              <Button
                onClick={onApplyCoupon}
                disabled={!couponCode || !!appliedCoupon || isValidatingCoupon}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800"
              >
                {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
              </Button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 text-xs text-green-700 animate-in fade-in slide-in-from-top-1">
                <span className="font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Cupom {appliedCoupon.code} aplicado!
                </span>
                <span className="font-bold">
                  -
                  {appliedCoupon.type === 'percentage'
                    ? `${appliedCoupon.value}%`
                    : `R$ ${appliedCoupon.value.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-8 pt-4 border-t border-slate-100">
            {appliedCoupon && (
              <>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Valor original:</span>
                  <span className="line-through">{price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Desconto:</span>
                  <span>-R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-slate-900">Total a pagar:</span>
              <span className="font-extrabold text-2xl text-blue-600">{finalPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
