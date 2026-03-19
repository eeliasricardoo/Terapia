'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

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
  matchedInsurance?: { id: string; name: string } | null
  isFetchingInfo: boolean
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
  matchedInsurance,
  isFetchingInfo,
}: OrderSummaryProps) {
  if (isFetchingInfo) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <Card className="rounded-3xl border-none shadow-sm h-[500px] bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
      <h2 className="text-xl font-bold mb-6 text-slate-900 font-outfit">Resumo da sua compra</h2>
      <Card className="overflow-hidden border-none shadow-2xl shadow-blue-900/10 rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="h-20 w-20" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 font-bold text-2xl">
              {doctorName.charAt(0)}
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
                Profissional
              </p>
              <h3 className="text-xl font-bold font-outfit">{doctorName}</h3>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          <div className="space-y-5">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Especialidade:</span>
              <span className="font-bold text-slate-800 text-sm">Psicologia Clínica</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Data e Hora:</span>
              <span className="font-bold text-slate-800 text-sm">
                {date} às {time}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Local:</span>
              <span className="font-bold text-blue-600 text-sm">Google Meet (Online)</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500 font-medium font-outfit text-sm">Duração:</span>
              <span className="font-bold text-slate-800 text-sm">50 minutos de sessão</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            {matchedInsurance ? (
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-0.5">
                    Benefício Ativo
                  </p>
                  <p className="text-sm font-bold text-blue-600">{matchedInsurance.name}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 font-outfit">
                    Cupom de Desconto
                  </h4>
                </div>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      disabled={isValidatingCoupon}
                    />
                    <Button
                      onClick={onApplyCoupon}
                      disabled={!couponCode || isValidatingCoupon}
                      className="h-[46px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-4"
                    >
                      {isValidatingCoupon ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold tracking-tight">
                        Cupom {appliedCoupon.code}
                      </span>
                    </div>
                    <span className="font-black text-sm">
                      -
                      {appliedCoupon.type === 'percentage'
                        ? `${appliedCoupon.value}%`
                        : `R$ ${appliedCoupon.value.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 space-y-3">
            {appliedCoupon && !matchedInsurance && (
              <>
                <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
                  <span>Valor da sessão:</span>
                  <span>{price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
                  <span>Desconto aplicado:</span>
                  <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-end pt-2">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Total a pagar
                </p>
                <p className="font-black text-3xl text-slate-900 tracking-tighter">{finalPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium mb-1">
                  Pagamento processado por
                </p>
                <div className="h-6 w-12 bg-slate-100 rounded flex items-center justify-center grayscale opacity-50">
                  <span className="font-black text-[10px] text-slate-500">Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
