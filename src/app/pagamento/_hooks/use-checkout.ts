'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPsychologistById } from '@/lib/actions/psychologists'
import { createStripeCheckoutSession } from '@/lib/actions/stripe'
import { fromZonedTime } from 'date-fns-tz'

export function useCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL Params
  const doctorId = searchParams.get('doctor')
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  // Fetch States
  const [userId, setUserId] = useState<string | null>(null)
  const [doctorName, setDoctorName] = useState('Carregando...')
  const [price, setPrice] = useState('R$ --,--')
  const [priceRaw, setPriceRaw] = useState(0)
  const [isFetchingInfo, setIsFetchingInfo] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [psychTimezone, setPsychTimezone] = useState('America/Sao_Paulo')

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    type: 'percentage' | 'fixed'
    value: number
  } | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)

  useEffect(() => {
    const loadCheckoutInfo = async () => {
      setIsFetchingInfo(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      if (doctorId) {
        const psych = await getPsychologistById(doctorId)
        if (psych) {
          setDoctorName(
            psych.profile?.full_name ? `Dr(a). ${psych.profile.full_name}` : 'Psicólogo(a)'
          )
          if (psych.price_per_session) {
            setPriceRaw(Number(psych.price_per_session))
            setPrice(`R$ ${Number(psych.price_per_session).toFixed(2).replace('.', ',')}`)
          } else {
            setPrice('Gratuito')
          }
          if (psych.timezone) {
            setPsychTimezone(psych.timezone)
          }
        }
      }
      setIsFetchingInfo(false)
    }
    loadCheckoutInfo()
  }, [doctorId])

  useEffect(() => {
    let discount = 0
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = priceRaw * (appliedCoupon.value / 100)
      } else {
        discount = appliedCoupon.value
      }
    }
    setDiscountAmount(discount)
    setFinalPrice(Math.max(0, priceRaw - discount))
  }, [priceRaw, appliedCoupon])

  const applyCoupon = async () => {
    if (!couponCode || !doctorId) return

    setIsValidatingCoupon(true)
    try {
      const { validateCoupon } = await import('@/lib/actions/coupons')
      const result = await validateCoupon(couponCode, doctorId)

      if (result.success) {
        setAppliedCoupon({
          code: result.data.code,
          type: result.data.type,
          value: result.data.value,
        })
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Erro ao validar cupom')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handlePayment = async () => {
    if (!userId || !doctorId || !date || !time) {
      alert('Informações de agendamento incompletas. Por favor, volte ao perfil do psicólogo.')
      return
    }

    setIsProcessing(true)
    try {
      const localDateTimeString = `${date}T${time}:00`
      const utcDate = fromZonedTime(localDateTimeString, psychTimezone)
      const scheduledAt = utcDate.toISOString()

      // 🚀 STRIPE FLOW
      const result = await createStripeCheckoutSession({
        psychologistId: doctorId,
        scheduledAt: scheduledAt,
        durationMinutes: 50,
        couponCode: appliedCoupon?.code,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        // Redirect user to Stripe Checkout
        window.location.href = result.url
      }
    } catch (error: any) {
      console.error('Stripe error:', error)
      alert(error.message || 'Erro ao iniciar o pagamento.')
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    doctorId,
    date,
    time,
    doctorName,
    price,
    priceRaw,
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

    handlePayment,
    applyCoupon,
  }
}
