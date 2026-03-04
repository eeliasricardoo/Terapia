'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function PaymentStatusToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const payment = searchParams.get('payment')

  useEffect(() => {
    if (payment === 'success') {
      toast.success('Pagamento confirmado! Sua sessão foi agendada com sucesso.', {
        duration: 5000,
      })
      // Clean up URL
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('payment')
      newParams.delete('session_id')
      router.replace(`/dashboard?${newParams.toString()}`)
    }

    if (payment === 'cancelled') {
      toast.error('O pagamento foi cancelado. Você pode tentar novamente quando desejar.')
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('payment')
      router.replace(`/dashboard?${newParams.toString()}`)
    }
  }, [payment, router, searchParams])

  return null
}
