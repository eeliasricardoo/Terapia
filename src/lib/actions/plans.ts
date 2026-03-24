'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'

export type PlanData = {
  id: string
  name: string
  sessions: number
  price: number
  discount: number
  active: boolean
}

async function getPsychologistProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return prisma.psychologistProfile.findUnique({ where: { userId: user.id } })
}

export async function getPlans(): Promise<
  { success: true; data: PlanData[] } | { success: false; error: string }
> {
  try {
    const profile = await getPsychologistProfile()
    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    const plans = await prisma.plan.findMany({
      where: { psychologistId: profile.id },
      orderBy: { createdAt: 'asc' },
    })

    return {
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        sessions: p.sessions,
        price: Number(p.price),
        discount: p.discount,
        active: p.active,
      })),
    }
  } catch (error) {
    logger.error('Error fetching plans', { error })
    return { success: false, error: 'Erro ao carregar pacotes' }
  }
}

export async function createPlan(data: {
  name: string
  sessions: number
  price: number
  discount: number
}): Promise<{ success: true; data: PlanData } | { success: false; error: string }> {
  try {
    const profile = await getPsychologistProfile()
    if (!profile) return { success: false, error: 'Perfil não encontrado' }

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
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        sessions: plan.sessions,
        price: Number(plan.price),
        discount: plan.discount,
        active: plan.active,
      },
    }
  } catch (error) {
    logger.error('Error creating plan', { error })
    return { success: false, error: 'Erro ao criar pacote' }
  }
}

export async function updatePlan(
  id: string,
  data: { name: string; sessions: number; price: number; discount: number }
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const profile = await getPsychologistProfile()
    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    await prisma.plan.update({
      where: { id, psychologistId: profile.id },
      data: {
        name: data.name,
        sessions: data.sessions,
        price: data.price,
        discount: data.discount,
      },
    })

    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  } catch (error) {
    logger.error('Error updating plan', { error })
    return { success: false, error: 'Erro ao atualizar pacote' }
  }
}

export async function togglePlan(
  id: string,
  active: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const profile = await getPsychologistProfile()
    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    await prisma.plan.update({ where: { id, psychologistId: profile.id }, data: { active } })
    return { success: true }
  } catch (error) {
    logger.error('Error toggling plan', { error })
    return { success: false, error: 'Erro ao atualizar pacote' }
  }
}

export async function deletePlan(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const profile = await getPsychologistProfile()
    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    await prisma.plan.delete({ where: { id, psychologistId: profile.id } })
    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  } catch (error) {
    logger.error('Error deleting plan', { error })
    return { success: false, error: 'Erro ao excluir pacote' }
  }
}
