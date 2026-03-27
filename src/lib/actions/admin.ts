'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/utils/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApprovalEmailTemplate, getRejectionEmailTemplate } from '@/lib/utils/email-templates'

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

    const supabaseAdmin = createAdminClient()

    // Self-healing: Check for psychologists in profiles table that are not yet in Users/PsychologistProfile
    // This happens because some signup flows were missing the Prisma sync
    const orphanPsychologists = await prisma.profile.findMany({
      where: { role: 'PSYCHOLOGIST' },
      include: {
        users: {
          include: {
            psychologistProfile: true,
          },
        },
      },
    })

    for (const op of orphanPsychologists) {
      if (!op.users) {
        // Sync User table (public) from Profile/Auth metadata
        // We know they exist in auth.users because profile exists (FK user_id)
        try {
          // Fetch real email from Auth Admin since it might be missing in Public Schema
          const {
            data: { user: authUser },
          } = await supabaseAdmin.auth.admin.getUserById(op.user_id)

          if (authUser) {
            await prisma.user.upsert({
              where: { id: op.user_id },
              update: {
                name: op.fullName || authUser.user_metadata?.full_name,
                role: 'PSYCHOLOGIST',
                email: authUser.email || '',
              },
              create: {
                id: op.user_id,
                name: op.fullName || authUser.user_metadata?.full_name || 'Psicólogo',
                email: authUser.email || '',
                role: 'PSYCHOLOGIST',
              },
            })
          }
        } catch (e) {
          logger.error(`Error healing user record for ${op.user_id}:`, e)
        }
      }

      // Ensure they have a PsychologistProfile record if they don't yet
      if (!op.users?.psychologistProfile) {
        try {
          await prisma.psychologistProfile.upsert({
            where: { userId: op.user_id },
            update: {},
            create: {
              userId: op.user_id,
              isVerified: false,
            },
          })
        } catch (e) {
          logger.error(`Error healing psychologist profile for ${op.user_id}:`, e)
        }
      }
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

    return await Promise.all(
      pending.map(async (p) => {
        let diplomaSignedUrl = null
        let licenseSignedUrl = null

        if (p.diplomaUrl) {
          const { data: signData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(p.diplomaUrl, 3600)
          diplomaSignedUrl = signData?.signedUrl
        }

        if (p.licenseUrl) {
          const { data: signData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(p.licenseUrl, 3600)
          licenseSignedUrl = signData?.signedUrl
        }

        return {
          id: p.id,
          userId: p.userId,
          fullName: p.user.profiles?.fullName || p.user.name || 'Psicólogo',
          email: p.user.email,
          crp: p.crp,
          specialties: p.specialties,
          bio: p.bio,
          pricePerSession: Number(p.pricePerSession || 0),
          yearsOfExperience: p.yearsOfExperience,
          university: p.university,
          academicLevel: p.academicLevel,
          diplomaUrl: diplomaSignedUrl,
          licenseUrl: licenseSignedUrl,
          createdAt: p.createdAt.toISOString(),
          avatarUrl: p.user.profiles?.avatarUrl,
        }
      })
    )
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
      html: getApprovalEmailTemplate(
        psychologist.user.profiles?.fullName || 'Psicólogo',
        psychologist.crp || ''
      ),
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/aprovacoes')
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

export async function getAllPsychologists(page: number = 1, pageSize: number = 50) {
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

    // Pagination with reasonable default (50 per page)
    const skip = (page - 1) * pageSize
    const psychologists = await prisma.psychologistProfile.findMany({
      include: {
        user: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: skip,
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

    // Atualiza o papel para PATIENT tanto no User quanto no Profile
    await prisma.user.update({
      where: { id: psychologist.userId },
      data: {
        role: 'PATIENT',
        profiles: {
          update: {
            role: 'PATIENT',
          },
        },
      },
    })

    // Send Rejection Email
    await sendEmail({
      to: psychologist.user.email,
      subject: 'Atualização do seu cadastro na Terapia',
      html: getRejectionEmailTemplate(psychologist.user.profiles?.fullName || 'Psicólogo', reason),
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/aprovacoes')
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

async function ensureAdmin() {
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
  return user
}

export async function getHealthInsurances() {
  try {
    await ensureAdmin()
    return await prisma.healthInsurance.findMany({
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    logger.error('Error fetching health insurances:', error)
    return []
  }
}

export async function createHealthInsurance(name: string) {
  try {
    await ensureAdmin()
    const insurance = await prisma.healthInsurance.create({
      data: { name },
    })
    revalidatePath('/dashboard/admin/planos')
    return { success: true, data: insurance }
  } catch (error) {
    logger.error('Error creating health insurance:', error)
    return { success: false, error: 'Falha ao criar plano de saúde' }
  }
}

export async function updateHealthInsurance(id: string, name: string) {
  try {
    await ensureAdmin()
    const insurance = await prisma.healthInsurance.update({
      where: { id },
      data: { name },
    })
    revalidatePath('/dashboard/admin/planos')
    return { success: true, data: insurance }
  } catch (error) {
    logger.error('Error updating health insurance:', error)
    return { success: false, error: 'Falha ao atualizar plano de saúde' }
  }
}

export async function deleteHealthInsurance(id: string) {
  try {
    await ensureAdmin()
    await prisma.healthInsurance.delete({
      where: { id },
    })
    revalidatePath('/dashboard/admin/planos')
    return { success: true }
  } catch (error) {
    logger.error('Error deleting health insurance:', error)
    return { success: false, error: 'Falha ao excluir plano de saúde' }
  }
}
