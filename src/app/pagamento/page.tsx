'use client'

import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { useCheckout } from './_hooks/use-checkout'
import { CheckoutBreadcrumb } from './_components/checkout-breadcrumb'
import { OrderSummary } from './_components/order-summary'
import { PaymentMethods } from './_components/payment-methods'
import { SuccessState } from './_components/success-state'

function PaymentContent() {
  const {
    date,
    time,
    doctorName,
    price,
    isFetchingInfo,
    isProcessing,
    isSuccess,
    psychTimezone,

    handlePayment,
  } = useCheckout()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container py-12 max-w-7xl">
        <CheckoutBreadcrumb />

        {isSuccess ? (
          <SuccessState
            doctorName={doctorName}
            date={date}
            time={time}
            psychTimezone={psychTimezone}
          />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                Finalizar Pagamento Seguro
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Seu pagamento é 100% seguro. Todos os dados são criptografados.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <OrderSummary
                doctorName={doctorName}
                date={date}
                time={time}
                price={price}
                psychTimezone={psychTimezone}
              />

              <PaymentMethods
                handlePayment={handlePayment}
                isProcessing={isProcessing}
                isFetchingInfo={isFetchingInfo}
                price={price}
              />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}
    >
      <PaymentContent />
    </Suspense>
  )
}
