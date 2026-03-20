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
  const plan = searchParams.get('plan') || 'single'

  const [userId, setUserId] = useState<string | null>(null)
  const [doctorName, setDoctorName] = useState('Carregando...')
  const [specialty, setSpecialty] = useState('Psicologia Clínica')
  const [price, setPrice] = useState('R$ --,--')
  const [priceRaw, setPriceRaw] = useState(0)
  const [duration, setDuration] = useState(50)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [formattedDate, setFormattedDate] = useState('')
  const [isFetchingInfo, setIsFetchingInfo] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [psychTimezone, setPsychTimezone] = useState('America/Sao_Paulo')
  const [patientProfile, setPatientProfile] = useState<any>(null)
  const [matchedInsurance, setMatchedInsurance] = useState<{ id: string; name: string } | null>(
    null
  )

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
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setPatientProfile(profile)
      }

      if (date) {
        const [year, month, day] = date.split('-').map(Number)
        const d = new Date(year, month - 1, day)
        setFormattedDate(
          d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
        )
      }

      if (doctorId) {
        const psych = await getPsychologistById(doctorId)
        if (psych) {
          const name = psych.profile?.full_name || 'Psicólogo(a)'
          const nameHasDr =
            name.toLowerCase().includes('dr.') || name.toLowerCase().includes('dra.')
          setDoctorName(nameHasDr ? name : `Dr(a). ${name}`)

          if (psych.specialties && psych.specialties.length > 0) {
            setSpecialty(psych.specialties[0])
          }
          if (psych.profile?.avatar_url) {
            setAvatarUrl(psych.profile.avatar_url)
          }
          if (psych.price_per_session) {
            const basePrice = Number(psych.price_per_session)
            const finalBasePrice = plan === 'monthly' ? basePrice * 0.8 : basePrice
            setPriceRaw(finalBasePrice)
            setPrice(`R$ ${finalBasePrice.toFixed(2).replace('.', ',')}`)
          } else {
            setPrice('Gratuito')
          }
          if (psych.timezone) {
            setPsychTimezone(psych.timezone)
          }
          if (psych.session_duration) {
            setDuration(psych.session_duration)
          }

          // Check for insurance match
          if (patientProfile?.healthInsuranceId && (psych as any).acceptedInsurances) {
            const match = (psych as any).acceptedInsurances.find(
              (ins: any) => ins.id === patientProfile.healthInsuranceId
            )
            if (match) {
              setMatchedInsurance(match)
            }
          }
        }
      }
      setIsFetchingInfo(false)
    }
    loadCheckoutInfo()
  }, [doctorId, patientProfile?.id])

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
      // Normalizar data (YYYY-M-D -> YYYY-MM-DD)
      const normalizedDate = date
        .split('-')
        .map((part, i) => (i === 0 ? part : part.padStart(2, '0')))
        .join('-')

      // Normalizar hora (H:mm -> HH:mm)
      const normalizedTime = time.padStart(5, '0')

      const localDateTimeString = `${normalizedDate} ${normalizedTime}:00`
      const utcDate = fromZonedTime(localDateTimeString, psychTimezone)
      const scheduledAt = utcDate.toISOString()

      // 🏆 INSURANCE FLOW
      if (matchedInsurance) {
        // Here we would likely call a different action to create insurance-backed appointment
        // For now, we'll try to find a way to mark it or just bypass Stripe
        const { createInsuranceAppointment } = await import('@/lib/actions/appointments')
        const result = await createInsuranceAppointment({
          psychologistId: doctorId,
          scheduledAt,
          durationMinutes: 50,
          healthInsuranceId: matchedInsurance.id,
          healthInsurancePolicy: patientProfile?.healthInsurancePolicy || '',
        })

        if (result.success) {
          setIsSuccess(true)
        } else {
          throw new Error(result.error || 'Erro ao agendar pelo plano.')
        }
        return
      }

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
    date: formattedDate || date,
    time,
    doctorName,
    specialty,
    duration,
    avatarUrl,
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
    finalPrice: matchedInsurance
      ? `Cobrado pelo plano (${matchedInsurance.name})`
      : `R$ ${finalPrice.toFixed(2).replace('.', ',')}`,
    matchedInsurance,

    handlePayment,
    applyCoupon,
  }
}
