'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'

export type CouponData = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  maxUses?: number
  used: number
  active: boolean
}

export async function getCoupons(): Promise<
  { success: true; data: CouponData[] } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      include: { coupons: true },
    })

    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    return {
      success: true,
      data: profile.coupons.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type as 'percentage' | 'fixed',
        value: Number(c.value),
        maxUses: c.maxUses || undefined,
        used: c.used,
        active: c.active,
      })),
    }
  } catch (error) {
    logger.error('Error fetching coupons', { error })
    return { success: false, error: 'Erro ao carregar cupons' }
  }
}

export async function createCoupon(data: {
  code: string
  type: string
  value: number
  maxUses?: number
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    await prisma.coupon.create({
      data: {
        psychologistId: profile.id,
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        active: true,
      },
    })

    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  } catch (error) {
    logger.error('Error creating coupon', { error })
    return { success: false, error: 'Erro ao criar cupom' }
  }
}

export async function toggleCoupon(
  id: string,
  active: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    await prisma.coupon.update({
      where: { id },
      data: { active },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error toggling coupon', { error })
    return { success: false, error: 'Erro ao atualizar cupom' }
  }
}

export async function deleteCoupon(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    await prisma.coupon.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error deleting coupon', { error })
    return { success: false, error: 'Erro ao deletar cupom' }
  }
}

export async function validateCoupon(
  code: string,
  psychologistId: string
): Promise<{ success: true; data: CouponData } | { success: false; error: string }> {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        active: true,
      },
    })

    if (!coupon) return { success: false, error: 'Cupom inválido ou expirado' }

    if (coupon.maxUses && coupon.used >= coupon.maxUses) {
      return { success: false, error: 'Este cupom já atingiu o limite de usos' }
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { success: false, error: 'Cupom expirado' }
    }

    return {
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type as 'percentage' | 'fixed',
        value: Number(coupon.value),
        maxUses: coupon.maxUses || undefined,
        used: coupon.used,
        active: coupon.active,
      },
    }
  } catch (error) {
    logger.error('Error validating coupon', { error })
    return { success: false, error: 'Erro ao validar cupom' }
  }
}
