import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type PlanData = {
  id: string
  name: string
  sessions: number
  price: number
  discount: number
  active: boolean
}

const planSchema = z.object({
  name: z.string().min(1),
  sessions: z.number().int().positive(),
  price: z.number().positive(),
  discount: z.number().min(0).max(100),
})

export const getPlansAction = createSafeAction(
  z.void().optional(),
  async (_, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Perfil não encontrado')

    const plans = await prisma.plan.findMany({
      where: { psychologistId: profile.id },
      orderBy: { createdAt: 'asc' },
    })

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      sessions: p.sessions,
      price: Number(p.price),
      discount: p.discount,
      active: p.active,
    }))
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const createPlanAction = createSafeAction(
  planSchema,
  async (data, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Perfil não encontrado')

    const plan = await prisma.plan.create({
      data: {
        psychologistId: profile.id,
        name: data.name,
        sessions: data.sessions,
        price: data.price,
        discount: data.discount,
        active: true,
      },
    })

    revalidatePath('/dashboard/configuracoes')
    return {
      id: plan.id,
      name: plan.name,
      sessions: plan.sessions,
      price: Number(plan.price),
      discount: plan.discount,
      active: plan.active,
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const updatePlanAction = createSafeAction(
  z.object({ id: z.string().uuid(), data: planSchema }),
  async (input, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.plan.update({
      where: { id: input.id, psychologistId: profile.id },
      data: {
        name: input.data.name,
        sessions: input.data.sessions,
        price: input.data.price,
        discount: input.data.discount,
      },
    })

    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const togglePlanAction = createSafeAction(
  z.object({ id: z.string().uuid(), active: z.boolean() }),
  async (data, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.plan.update({
      where: { id: data.id, psychologistId: profile.id },
      data: { active: data.active },
    })

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const deletePlanAction = createSafeAction(
  z.string().uuid(),
  async (id, user) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.plan.delete({
      where: { id, psychologistId: profile.id },
    })

    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
