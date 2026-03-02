"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getPsychologistById } from "@/lib/actions/psychologists"
import { createSession } from "@/lib/actions/sessions"
import { fromZonedTime } from "date-fns-tz"

export function useCheckout() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL Params
    const doctorId = searchParams.get("doctor")
    const date = searchParams.get("date")
    const time = searchParams.get("time")

    // Fetch States
    const [userId, setUserId] = useState<string | null>(null)
    const [doctorName, setDoctorName] = useState("Carregando...")
    const [price, setPrice] = useState("R$ --,--")
    const [priceRaw, setPriceRaw] = useState(0)
    const [isFetchingInfo, setIsFetchingInfo] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [psychTimezone, setPsychTimezone] = useState("America/Sao_Paulo")

    // Form inputs
    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvv, setCvv] = useState("")

    useEffect(() => {
        const loadCheckoutInfo = async () => {
            setIsFetchingInfo(true)
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            if (doctorId) {
                const psych = await getPsychologistById(doctorId)
                if (psych) {
                    setDoctorName(psych.profile?.full_name ? `Dr(a). ${psych.profile.full_name}` : "Psicólogo(a)")
                    if (psych.price_per_session) {
                        setPriceRaw(Number(psych.price_per_session))
                        setPrice(`R$ ${Number(psych.price_per_session).toFixed(2).replace('.', ',')}`)
                    } else {
                        setPrice("Gratuito")
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

    const handlePayment = async () => {
        if (!userId || !doctorId || !date || !time) {
            alert("Informações de agendamento incompletas. Por favor, volte ao perfil do psicólogo.")
            return
        }

        setIsProcessing(true)
        try {
            const localDateTimeString = `${date}T${time}:00`
            const utcDate = fromZonedTime(localDateTimeString, psychTimezone)
            const scheduledAt = utcDate.toISOString()

            const result = await createSession({
                patientId: userId,
                psychologistId: doctorId,
                scheduledAt: scheduledAt,
                durationMinutes: 50
            })

            if (!result.success) {
                throw new Error(result.error || "Falha ao processar agendamento")
            }

            setIsSuccess(true)
            window.scrollTo(0, 0)
        } catch (error: any) {
            console.error("Payment error:", error)
            alert(error.message || "Erro no processamento do pagamento.")
        } finally {
            setIsProcessing(false)
        }
    }

    return {
        doctorId, date, time,
        doctorName, price, priceRaw,
        isFetchingInfo, isProcessing, isSuccess,
        psychTimezone,
        cardForm: {
            cardNumber, setCardNumber,
            cardName, setCardName,
            expiry, setExpiry,
            cvv, setCvv
        },
        handlePayment
    }
}
