'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'

export async function getPendingPsychologists() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    // Check ADMIN role
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile || profile.role !== 'ADMIN') {
      throw new Error('Não autorizado')
    }

    const pending = await prisma.psychologistProfile.findMany({
      where: { isVerified: false },
      include: {
        user: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return pending.map((p) => ({
      id: p.id,
      userId: p.userId,
      fullName: p.user.profiles?.fullName || p.user.name || 'Psicólogo',
      email: p.user.email,
      crp: p.crp,
      specialties: p.specialties,
      createdAt: p.createdAt.toISOString(),
      avatarUrl: p.user.profiles?.avatarUrl,
    }))
  } catch (error) {
    logger.error('Error fetching pending psychologists:', error)
    return []
  }
}

export async function verifyPsychologist(psychologistId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile || profile.role !== 'ADMIN') {
      throw new Error('Não autorizado')
    }

    await prisma.psychologistProfile.update({
      where: { id: psychologistId },
      data: { isVerified: true },
    })

    revalidatePath('/admin-sistema')
    return { success: true }
  } catch (error) {
    logger.error('Error verifying psychologist:', error)
    return { success: false, error: 'Falha ao verificar psicólogo' }
  }
}

export async function getAdminStats() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile || profile.role !== 'ADMIN') {
      throw new Error('Não autorizado')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalPatients,
      totalPsychologists,
      pendingPsychologists,
      activeAppointments,
      activeUsersToday,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { role: 'PSYCHOLOGIST' } }),
      prisma.psychologistProfile.count({ where: { isVerified: false } }),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.user.count({ where: { updatedAt: { gte: today } } }),
      prisma.appointment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { price: true },
      }),
    ])

    return {
      totalPatients,
      totalPsychologists,
      pendingPsychologists,
      activeAppointments,
      activeUsersToday,
      totalRevenue: Number(totalRevenue._sum.price || 0),
    }
  } catch (error) {
    logger.error('Error fetching admin stats:', error)
    return {
      totalPatients: 0,
      totalPsychologists: 0,
      pendingPsychologists: 0,
      activeAppointments: 0,
      activeUsersToday: 0,
      totalRevenue: 0,
    }
  }
}
