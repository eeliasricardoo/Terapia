'use client'

import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useCheckout } from './_hooks/use-checkout'
import { CheckoutBreadcrumb } from './_components/checkout-breadcrumb'
import { OrderSummary } from './_components/order-summary'
import { PaymentMethods } from './_components/payment-methods'
import { SuccessState } from './_components/success-state'

function PaymentPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container py-6 sm:py-12 max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-20 bg-slate-200" />
          <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-32 bg-slate-200" />
        </div>
        {/* Header */}
        <div className="mb-10">
          <Skeleton className="h-9 w-72 mb-2 bg-slate-200" />
          <Skeleton className="h-4 w-48 bg-slate-100" />
        </div>
        {/* Two-column grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order summary skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-7 w-48 bg-slate-200" />
            <Card className="overflow-hidden border border-slate-100 rounded-3xl">
              <div className="p-8 text-center border-b border-slate-50 flex flex-col items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-3xl bg-slate-200" />
                <Skeleton className="h-4 w-24 bg-slate-100" />
                <Skeleton className="h-6 w-48 bg-slate-200" />
              </div>
              <div className="p-8 space-y-5">
                <Skeleton className="h-[72px] w-full rounded-2xl bg-slate-100" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-slate-50">
                    <Skeleton className="h-4 w-28 bg-slate-100" />
                    <Skeleton className="h-4 w-24 bg-slate-200" />
                  </div>
                ))}
                <Skeleton className="h-20 w-full rounded-2xl bg-slate-100 mt-6" />
              </div>
            </Card>
          </div>
          {/* Payment methods skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-7 w-56 bg-slate-200" />
            <Card className="border border-slate-100 rounded-3xl overflow-hidden">
              <div className="flex border-b border-slate-100">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="flex-1 h-14 rounded-none bg-slate-100" />
                ))}
              </div>
              <div className="p-8 space-y-8">
                <Skeleton className="h-24 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-200" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

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
      <main className="flex-1 container py-6 sm:py-12 max-w-7xl px-4 sm:px-6">
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

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
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
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentContent />
    </Suspense>
  )
}
