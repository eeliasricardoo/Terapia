import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type CouponData = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  maxUses?: number
  used: number
  active: boolean
}

const couponSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((v) => v.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
})

export const getCouponsAction = createSafeAction(
  z.void().optional(),
  async (_, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      include: { coupons: true },
    })

    if (!profile) throw new Error('Perfil não encontrado')

    return profile.coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type as 'percentage' | 'fixed',
      value: Number(c.value),
      maxUses: c.maxUses || undefined,
      used: c.used,
      active: c.active,
    }))
  },
  { requiredRole: ['PSYCHOLOGIST', 'ADMIN'] }
)

export const createCouponAction = createSafeAction(
  couponSchema,
  async (data, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) throw new Error('Perfil não encontrado')

    const coupon = await prisma.coupon.create({
      data: {
        psychologistId: profile.id,
        code: data.code,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        active: true,
      },
    })

    revalidatePath('/dashboard/configuracoes')
    return { success: true, id: coupon.id }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const toggleCouponAction = createSafeAction(
  z.object({ id: z.string().uuid(), active: z.boolean() }),
  async (data, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Acesso negado')

    await prisma.coupon.update({
      where: {
        id: data.id,
        psychologistId: profile.id, // Security: Ensure ownership
      },
      data: { active: data.active },
    })

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const deleteCouponAction = createSafeAction(
  z.string().uuid(),
  async (id, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Acesso negado')

    await prisma.coupon.delete({
      where: {
        id,
        psychologistId: profile.id, // Security: Ensure ownership
      },
    })

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const validateCouponAction = createSafeAction(
  z.object({ code: z.string(), psychologistId: z.string().uuid() }),
  async (data) => {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: data.code.toUpperCase(),
        active: true,
        psychologistId: data.psychologistId,
      },
    })

    if (!coupon) throw new Error('Cupom inválido ou expirado')

    if (coupon.maxUses && coupon.used >= coupon.maxUses) {
      throw new Error('Este cupom já atingiu o limite de usos')
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new Error('Cupom expirado')
    }

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as 'percentage' | 'fixed',
      value: Number(coupon.value),
      maxUses: coupon.maxUses || undefined,
      used: coupon.used,
      active: coupon.active,
    }
  },
  { isPublic: true }
)
