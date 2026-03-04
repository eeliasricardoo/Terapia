'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function createStripeCheckoutSession(data: {
    psychologistId: string
    scheduledAt: string
    durationMinutes: number
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Não autenticado')

        // 1. Fetch psychologist info for price and name
        const psych = await prisma.psychologistProfile.findUnique({
            where: { id: data.psychologistId },
            include: { user: { include: { profiles: true } } }
        })

        if (!psych) throw new Error('Psicólogo não encontrado')

        const price = Number(psych.pricePerSession) || 0
        const stripeAmount = Math.round(price * 100) // Price in cents

        if (stripeAmount <= 0) {
            // In case of free, we don't need Stripe, but MVP should handle it. 
            // For now assume price > 0.
            throw new Error('Preço inválido para pagamento via Stripe')
        }

        const psychologistName = psych.user.profiles?.fullName || psych.user.name || 'Psicólogo'

        // 2. Create the Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Sessão de Terapia com ${psychologistName}`,
                            description: `Agendada para ${new Date(data.scheduledAt).toLocaleString('pt-BR')}`,
                        },
                        unit_amount: stripeAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                patientId: user.id,
                psychologistId: data.psychologistId,
                scheduledAt: data.scheduledAt,
                durationMinutes: data.durationMinutes,
                price: price.toString(),
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento?payment=cancelled`,
        })

        return { url: session.url }
    } catch (error: any) {
        logger.error('Error creating Stripe session:', error)
        return { error: error.message || 'Erro ao processar pagamento' }
    }
}
