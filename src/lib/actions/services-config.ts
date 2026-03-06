'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

// ─── Types ────────────────────────────────────────────────────────

export type ServicesConfigData = {
  sessionPrice: string
  sessionDuration: string
  averagePlatformPrice: string | null
}

// ─── Get Services Config ──────────────────────────────────────────

export async function getServicesConfig(): Promise<
  { success: true; data: ServicesConfigData } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      select: {
        pricePerSession: true,
        sessionDuration: true,
      },
    })

    if (!profile) {
      return { success: false, error: 'Perfil de psicólogo não encontrado' }
    }

    // Calculate platform average price from all psychologists who have set a price
    const avgResult = await prisma.psychologistProfile.aggregate({
      _avg: {
        pricePerSession: true,
      },
      where: {
        pricePerSession: { not: null },
      },
    })

    const averagePrice = avgResult._avg.pricePerSession
      ? Number(avgResult._avg.pricePerSession).toFixed(2)
      : null

    return {
      success: true,
      data: {
        sessionPrice: profile.pricePerSession ? Number(profile.pricePerSession).toFixed(2) : '',
        sessionDuration: profile.sessionDuration.toString(),
        averagePlatformPrice: averagePrice,
      },
    }
  } catch (error) {
    logger.error('Error fetching services config', { error })
    return { success: false, error: 'Erro ao carregar configurações' }
  }
}

// ─── Save General Config ──────────────────────────────────────────

export async function saveGeneralConfig(
  sessionPrice: string,
  sessionDuration: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const price = parseFloat(sessionPrice)
    const duration = parseInt(sessionDuration, 10)

    if (isNaN(price) || price <= 0) {
      return { success: false, error: 'Valor da sessão inválido' }
    }

    if (isNaN(duration) || duration <= 0) {
      return { success: false, error: 'Duração da sessão inválida' }
    }

    await prisma.psychologistProfile.update({
      where: { userId: user.id },
      data: {
        pricePerSession: price,
        sessionDuration: duration,
      },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error saving general config', { error })
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}
