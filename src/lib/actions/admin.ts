'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/utils/email'

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

    const psychologist = await prisma.psychologistProfile.update({
      where: { id: psychologistId },
      data: { isVerified: true, suspensionReason: null },
      include: {
        user: { include: { profiles: true } },
      },
    })

    // Notify Psychologist
    await sendEmail({
      to: psychologist.user.email,
      subject: 'Bem-vindo à Terapia! Seu perfil foi aprovado',
      html: `
        <h2>Excelente notícia, ${psychologist.user.profiles?.fullName || 'Psicólogo'}!</h2>
        <p>A equipe da Terapia verificou e aprovou seu cadastro (CRP: ${psychologist.crp}).</p>
        <p>A partir de agora, você já aparece nos resultados de busca da plataforma para que pacientes possam agendar sessões com você.</p>
        <br/>
        <p>Atenciosamente,</p>
        <p>Equipe Terapia</p>
      `,
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

export async function getAllPsychologists() {
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

    const psychologists = await prisma.psychologistProfile.findMany({
      include: {
        user: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return psychologists.map((p) => ({
      id: p.id,
      userId: p.userId,
      fullName: p.user.profiles?.fullName || p.user.name || 'Psicólogo',
      email: p.user.email,
      crp: p.crp,
      specialties: p.specialties,
      isVerified: p.isVerified,
      suspensionReason: p.suspensionReason,
      createdAt: p.createdAt.toISOString(),
      avatarUrl: p.user.profiles?.avatarUrl,
    }))
  } catch (error) {
    logger.error('Error fetching all psychologists:', error)
    return []
  }
}

export async function rejectPsychologist(psychologistId: string, reason: string) {
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

    const psychologist = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistId },
      include: {
        user: { include: { profiles: true } },
      },
    })

    if (!psychologist) throw new Error('Psicólogo não encontrado')

    // Atualmente estamos apenas deletando o perfil de psicólogo, ele pode recriar.
    await prisma.psychologistProfile.delete({
      where: { id: psychologistId },
    })

    // Deleta o tipo PSYCHOLOGIST para o User se não houver Profile
    await prisma.user.update({
      where: { id: psychologist.userId },
      data: { role: 'PATIENT' }, // Volta para paciente
    })

    // Send Rejection Email
    await sendEmail({
      to: psychologist.user.email,
      subject: 'Atualização do seu cadastro na Terapia',
      html: `
        <h2>Olá, ${psychologist.user.profiles?.fullName || 'Psicólogo'}!</h2>
        <p>Infelizmente não pudemos aprovar o seu cadastro neste momento.</p>
        <p><strong>Motivo:</strong> ${reason}</p>
        <p>Você pode tentar se cadastrar novamente após corrigir os apontamentos acima.</p>
        <br/>
        <p>Atenciosamente,</p>
        <p>Equipe Terapia</p>
      `,
    })

    revalidatePath('/admin-sistema')
    return { success: true }
  } catch (error) {
    logger.error('Error rejecting psychologist:', error)
    return { success: false, error: 'Falha ao rejeitar psicólogo' }
  }
}

export async function suspendPsychologistAccess(
  psychologistId: string,
  reason: string,
  sendEmailNotification: boolean = true,
  emailMessage?: string
) {
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

    const psychologist = await prisma.psychologistProfile.update({
      where: { id: psychologistId },
      data: { isVerified: false, suspensionReason: reason }, // Suspende o acesso público e trava a conta
      include: {
        user: { include: { profiles: true } },
      },
    })

    if (sendEmailNotification) {
      // Notify Psychologist
      const customMessageHtml = emailMessage
        ? `<p><strong>Mensagem da Moderação:</strong> ${emailMessage}</p>`
        : `<p><strong>Motivo:</strong> ${reason}</p>`

      await sendEmail({
        to: psychologist.user.email,
        subject: 'Aviso Importante: Acesso Suspenso na Terapia',
        html: `
          <h2>Olá, ${psychologist.user.profiles?.fullName || 'Psicólogo'}.</h2>
          <p>A equipe de moderação da Terapia suspendeu seu acesso à plataforma.</p>
          ${customMessageHtml}
          <p>Seu perfil público foi ocultado e você retornou para a fase de análise de cadastro.</p>
          <p>Entre em contato com o suporte para mais informações.</p>
          <br/>
          <p>Atenciosamente,</p>
          <p>Equipe Terapia</p>
        `,
      })
    }

    revalidatePath('/dashboard/admin/psicologos')
    return { success: true }
  } catch (error) {
    logger.error('Error suspending psychologist:', error)
    return { success: false, error: 'Falha ao suspender acesso' }
  }
}
