'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/utils/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApprovalEmailTemplate, getRejectionEmailTemplate } from '@/lib/utils/email-templates'
import { createAuditLog } from '@/lib/utils/audit'
import { env } from '@/lib/env'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

/**
 * Fetches psychologists awaiting manual verification.
 * Includes "self-healing" logic to sync missing Prisma records.
 */
export const getPendingPsychologists = createSafeAction(
  z.void(),
  async (_, user) => {
    const supabaseAdmin = createAdminClient()

    // 1. Self-healing: Ensure profile roles match User/PsychologistProfile tables
    const orphanPsychologists = await prisma.profile.findMany({
      where: { role: 'PSYCHOLOGIST' },
      include: {
        users: {
          include: { psychologistProfile: true },
        },
      },
    })

    for (const op of orphanPsychologists) {
      if (!op.users) {
        try {
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
        user: { include: { profiles: true } },
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
            .createSignedUrl(p.diplomaUrl, 86400)
          diplomaSignedUrl = signData?.signedUrl
        }

        if (p.licenseUrl) {
          const { data: signData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(p.licenseUrl, 86400)
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
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Approves a psychologist profile.
 */
export const verifyPsychologist = createSafeAction(
  z.object({ psychologistId: z.string().uuid() }),
  async (data, user) => {
    const psychologist = await prisma.psychologistProfile.update({
      where: { id: data.psychologistId },
      data: { isVerified: true, suspensionReason: null },
      include: {
        user: { include: { profiles: true } },
      },
    })

    await sendEmail({
      to: psychologist.user.email,
      subject: 'Bem-vindo à Sentirz! Seu perfil foi aprovado',
      html: getApprovalEmailTemplate(
        psychologist.user.profiles?.fullName || 'Psicólogo',
        psychologist.crp || ''
      ),
    })

    await createAuditLog({
      userId: user.id,
      action: 'VERIFY_PSYCHOLOGIST',
      entity: 'PsychologistProfile',
      entityId: data.psychologistId,
      newData: { isVerified: true },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/aprovacoes')
    return { success: true }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Rejects a psychologist profile, reverting their role.
 */
export const rejectPsychologist = createSafeAction(
  z.object({ psychologistId: z.string().uuid(), reason: z.string().min(5) }),
  async (data, user) => {
    const psychologist = await prisma.psychologistProfile.findUnique({
      where: { id: data.psychologistId },
      include: { user: { include: { profiles: true } } },
    })

    if (!psychologist) throw new Error('Psicólogo não encontrado')

    await prisma.psychologistProfile.delete({
      where: { id: data.psychologistId },
    })

    await prisma.user.update({
      where: { id: psychologist.userId },
      data: {
        role: 'PATIENT',
        profiles: {
          update: { role: 'PATIENT' },
        },
      },
    })

    await sendEmail({
      to: psychologist.user.email,
      subject: 'Atualização do seu cadastro na Sentirz',
      html: getRejectionEmailTemplate(
        psychologist.user.profiles?.fullName || 'Psicólogo',
        data.reason
      ),
    })

    await createAuditLog({
      userId: user.id,
      action: 'REJECT_PSYCHOLOGIST',
      entity: 'PsychologistProfile',
      entityId: data.psychologistId,
      oldData: { psychologistUserId: psychologist.userId },
      newData: { reason: data.reason },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/aprovacoes')
    return { success: true }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Suspends psychologist access with a specific reason.
 */
export const suspendPsychologistAccess = createSafeAction(
  z.object({
    psychologistId: z.string().uuid(),
    reason: z.string().min(5),
    sendEmailNotification: z.boolean().default(true),
    emailMessage: z.string().optional(),
  }),
  async (data, user) => {
    const psychologist = await prisma.psychologistProfile.update({
      where: { id: data.psychologistId },
      data: { isVerified: false, suspensionReason: data.reason },
      include: {
        user: { include: { profiles: true } },
      },
    })

    if (data.sendEmailNotification) {
      const customMessageHtml = data.emailMessage
        ? `<p><strong>Mensagem da Moderação:</strong> ${data.emailMessage}</p>`
        : `<p><strong>Motivo:</strong> ${data.reason}</p>`

      await sendEmail({
        to: psychologist.user.email,
        subject: 'Aviso Importante: Acesso Suspenso na Sentirz',
        html: `
          <h2>Olá, ${psychologist.user.profiles?.fullName || 'Psicólogo'}.</h2>
          <p>A equipe de moderação da Sentirz suspendeu seu acesso à plataforma.</p>
          ${customMessageHtml}
          <p>Seu perfil público foi ocultado e você retornou para a fase de análise de cadastro.</p>
          <p>Entre em contato com o suporte para mais informações.</p>
          <br/>
          <p>Atenciosamente,</p>
          <p>Equipe Sentirz</p>
        `,
      })
    }

    await createAuditLog({
      userId: user.id,
      action: 'SUSPEND_PSYCHOLOGIST',
      entity: 'PsychologistProfile',
      entityId: data.psychologistId,
      newData: { reason: data.reason },
    })

    revalidatePath('/dashboard/admin/psicologos')
    return { success: true }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Reactivates a previously suspended psychologist.
 */
export const unsuspendPsychologist = createSafeAction(
  z.object({ psychologistId: z.string().uuid() }),
  async (data, user) => {
    const psychologist = await prisma.psychologistProfile.update({
      where: { id: data.psychologistId },
      data: { isVerified: true, suspensionReason: null },
      include: {
        user: { include: { profiles: true } },
      },
    })

    await sendEmail({
      to: psychologist.user.email,
      subject: 'Seu acesso foi reativado na Sentirz',
      html: `
        <h2>Olá, ${psychologist.user.profiles?.fullName || 'Psicólogo'}.</h2>
        <p>Seu acesso à plataforma Sentirz foi reativado pela equipe de moderação.</p>
        <p>Você já pode receber novos agendamentos normalmente.</p>
        <br/>
        <p>Atenciosamente,</p>
        <p>Equipe Sentirz</p>
      `,
    })

    await createAuditLog({
      userId: user.id,
      action: 'UNSUSPEND_PSYCHOLOGIST',
      entity: 'PsychologistProfile',
      entityId: data.psychologistId,
      newData: { isVerified: true },
    })

    revalidatePath('/dashboard/admin/psicologos')
    return { success: true }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Admin overview stats.
 */
export const getAdminStats = createSafeAction(
  z.void(),
  async (_, user) => {
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

    const revenue = Number(totalRevenue._sum.price || 0)
    const profit = revenue * (env.PLATFORM_FEE_PERCENT / 100)

    return {
      totalPatients,
      totalPsychologists,
      pendingPsychologists,
      activeAppointments,
      activeUsersToday,
      totalRevenue: revenue,
      platformProfit: profit,
    }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Paginated list of all psychologists for admin management.
 */
export const getAllPsychologists = createSafeAction(
  z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(50),
  }),
  async (data, user) => {
    const skip = (data.page - 1) * data.pageSize
    const psychologists = await prisma.psychologistProfile.findMany({
      include: {
        user: { include: { profiles: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: data.pageSize,
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
      stripeOnboardingComplete: p.stripeOnboardingComplete,
    }))
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Insurance management actions.
 */
export const getHealthInsurances = createSafeAction(
  z.void(),
  async () => {
    return await prisma.healthInsurance.findMany({
      orderBy: { name: 'asc' },
    })
  },
  { requiredRole: 'ADMIN' }
)

export const createHealthInsurance = createSafeAction(
  z.object({ name: z.string().min(2) }),
  async (data, user) => {
    const insurance = await prisma.healthInsurance.create({
      data: { name: data.name },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE_HEALTH_INSURANCE',
      entity: 'HealthInsurance',
      entityId: insurance.id,
      newData: { name: data.name },
    })
    revalidatePath('/dashboard/admin/planos')
    return insurance
  },
  { requiredRole: 'ADMIN' }
)

export const updateHealthInsurance = createSafeAction(
  z.object({ id: z.string().uuid(), name: z.string().min(2) }),
  async (data, user) => {
    const insurance = await prisma.healthInsurance.update({
      where: { id: data.id },
      data: { name: data.name },
    })
    revalidatePath('/dashboard/admin/planos')
    return insurance
  },
  { requiredRole: 'ADMIN' }
)

export const deleteHealthInsurance = createSafeAction(
  z.object({ id: z.string().uuid() }),
  async (data, user) => {
    await prisma.healthInsurance.delete({
      where: { id: data.id },
    })
    revalidatePath('/dashboard/admin/planos')
    return { success: true }
  },
  { requiredRole: 'ADMIN' }
)
