'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderSummaryProps {
  doctorName: string
  avatarUrl: string | null
  specialty: string
  duration: number
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
  avatarUrl,
  specialty,
  duration,
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
      <div className="space-y-6">
        <Skeleton className="h-7 w-48 bg-slate-200" />
        <Card className="overflow-hidden border border-slate-100 rounded-3xl">
          <div className="p-8 text-center border-b border-slate-50 flex flex-col items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-3xl bg-slate-200" />
            <Skeleton className="h-3 w-20 bg-slate-100" />
            <Skeleton className="h-6 w-44 bg-slate-200" />
          </div>
          <CardContent className="p-4 sm:p-8">
            <Skeleton className="h-16 w-full rounded-2xl bg-slate-100 mb-10" />
            <div className="space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between py-3 border-b border-slate-50">
                  <Skeleton className="h-4 w-28 bg-slate-100" />
                  <Skeleton className="h-4 w-24 bg-slate-200" />
                </div>
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-2xl bg-slate-100 mt-10" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
      <h2 className="text-xl font-bold mb-6 text-slate-900 font-outfit">Resumo da sua compra</h2>
      <Card className="overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl bg-white">
        <div className="p-5 sm:p-8 text-center border-b border-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 font-bold text-3xl overflow-hidden shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={doctorName} className="h-full w-full object-cover" />
              ) : (
                doctorName.charAt(0)
              )}
            </div>
            <div>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Profissional
              </p>
              <h3 className="text-xl font-bold font-outfit text-slate-900">{doctorName}</h3>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-8">
          <div className="mb-10 pb-10 border-b border-slate-100">
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
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">
                    Possui um Cupom?
                  </h4>
                </div>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                      disabled={isValidatingCoupon}
                    />
                    <Button
                      onClick={onApplyCoupon}
                      variant="outline"
                      disabled={!couponCode || isValidatingCoupon}
                      className="h-[42px] border-slate-200 hover:bg-slate-50 text-slate-900 font-bold rounded-xl px-4 text-xs"
                    >
                      {isValidatingCoupon ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold tracking-tight">
                        Cupom {appliedCoupon.code} ativado
                      </span>
                    </div>
                    <span className="font-black text-xs">
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

          <div className="space-y-5">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Especialidade:</span>
              <span className="font-bold text-slate-800 text-sm">{specialty}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Data e Hora:</span>
              <span className="font-bold text-slate-800 text-sm">
                {date} às {time}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium font-outfit text-sm">Local:</span>
              <span className="font-bold text-blue-600 text-sm">Plataforma (Online)</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500 font-medium font-outfit text-sm">Duração:</span>
              <span className="font-bold text-slate-800 text-sm">{duration} minutos de sessão</span>
            </div>
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
            <div className="mt-8 flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  Valor Total
                </p>
                <p className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tighter">
                  {finalPrice}
                </p>
              </div>
              <div className="h-10 w-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
