'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, CreditCard, QrCode, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethodsProps {
  handlePayment: () => void
  isProcessing: boolean
  isFetchingInfo: boolean
  price: string
  matchedInsurance?: { id: string; name: string } | null
}

export function PaymentMethods({
  handlePayment,
  isProcessing,
  isFetchingInfo,
  price,
  matchedInsurance,
}: PaymentMethodsProps) {
  const defaultTab = matchedInsurance ? 'insurance' : 'card'

  if (isFetchingInfo) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <Card className="border border-slate-100 rounded-3xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 h-14 bg-slate-50 animate-pulse" />
            ))}
          </div>
          <div className="p-8 space-y-8">
            <div className="h-24 w-full rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-14 w-full rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
      <h2 className="text-xl font-bold mb-6 text-slate-900 font-outfit">Método de pagamento</h2>

      <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="flex w-full bg-slate-50/50 border-b border-slate-100 p-0 h-14 rounded-none">
              <TabsTrigger
                value="card"
                disabled={!!matchedInsurance}
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-none h-full font-bold text-xs transition-all flex gap-2"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Cartão
              </TabsTrigger>
              <TabsTrigger
                value="pix"
                disabled={!!matchedInsurance}
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-emerald-600 rounded-none h-full font-bold text-xs transition-all flex gap-2"
              >
                <QrCode className="h-3.5 w-3.5" />
                Pix
              </TabsTrigger>
              {matchedInsurance && (
                <TabsTrigger
                  value="insurance"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 rounded-none h-full font-bold text-xs transition-all flex gap-2"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Convênio
                </TabsTrigger>
              )}
            </TabsList>

            <div className="p-8">
              <TabsContent value="card" className="mt-0 focus-visible:ring-0">
                <div className="space-y-8">
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900">Checkout Seguro Stripe</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Ao clicar em finalizar, você será levado ao ambiente seguro do Stripe para
                        completar o pagamento com seu cartão.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl transition-all hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      `Pagar ${price} com Cartão`
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pix" className="mt-0 focus-visible:ring-0">
                <div className="space-y-8">
                  <div className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <QrCode className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900">Pagamento Instantâneo via Pix</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        O QR Code será gerado na próxima tela. O acesso à terapia é liberado
                        imediatamente após a confirmação.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-100"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      `Pagar ${price} com Pix`
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="mt-0 focus-visible:ring-0">
                <div className="space-y-8">
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-start gap-4">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900">Agendamento pelo Convênio</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Tudo pronto! Seu plano <strong>{matchedInsurance?.name}</strong> cobre este
                        atendimento. Não haverá cobrança adicional.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-lg rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-100"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Confirmar via Convênio'
                    )}
                  </Button>
                </div>
              </TabsContent>

              <div className="mt-8 flex items-center justify-center gap-6 grayscale opacity-40">
                <div className="flex items-center gap-1 font-black text-xs text-slate-600">
                  <CreditCard className="h-3 w-3" /> VISA
                </div>
                <div className="flex items-center gap-1 font-black text-xs text-slate-600">
                  <CreditCard className="h-3 w-3" /> MASTERCARD
                </div>
                <div className="flex items-center gap-1 font-black text-xs text-slate-600">
                  <QrCode className="h-3 w-3" /> PIX
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3" /> Transação Criptografada (SSL)
              </p>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
