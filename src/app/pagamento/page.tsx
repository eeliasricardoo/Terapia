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
    doctorId,
    date,
    time,
    doctorName,
    specialty,
    duration,
    avatarUrl,
    price,
    isFetchingInfo,
    isProcessing,
    isSuccess,
    psychTimezone,

    couponCode,
    setCouponCode,
    isValidatingCoupon,
    appliedCoupon,
    discountAmount,
    finalPrice,
    matchedInsurance,

    handlePayment,
    applyCoupon,
  } = useCheckout()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container py-12 max-w-7xl">
        <CheckoutBreadcrumb doctorName={doctorName} doctorId={doctorId} />

        {isSuccess ? (
          <SuccessState
            doctorName={doctorName}
            date={date}
            time={time}
            psychTimezone={psychTimezone}
            matchedInsuranceName={matchedInsurance?.name}
          />
        ) : (
          <>
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 font-outfit">
                Finalizar Agendamento
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 justify-center lg:justify-start text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Ambiente seguro e criptografado
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <OrderSummary
                doctorName={doctorName}
                avatarUrl={avatarUrl}
                specialty={specialty}
                duration={duration}
                date={date}
                time={time}
                price={price}
                psychTimezone={psychTimezone}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                onApplyCoupon={applyCoupon}
                isValidatingCoupon={isValidatingCoupon}
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
                finalPrice={finalPrice}
                matchedInsurance={matchedInsurance}
                isFetchingInfo={isFetchingInfo}
              />

              <PaymentMethods
                handlePayment={handlePayment}
                isProcessing={isProcessing}
                isFetchingInfo={isFetchingInfo}
                price={finalPrice}
                matchedInsurance={matchedInsurance}
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
