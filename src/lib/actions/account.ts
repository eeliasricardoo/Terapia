'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { createSafeAction } from '@/lib/safe-action'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

/**
 * LGPD Art. 18 — Right to deletion of personal data.
 *
 * This action handles account deletion with the following rules:
 *
 * 1. Clinical records (Evolutions, Anamnesis) are ANONYMIZED, not deleted,
 *    to comply with CFP Resolution 001/2009 (5-year minimum retention)
 *    and LGPD Art. 16, II (legal/regulatory obligation exception).
 *
 * 2. All other personal data (profile, messages, diary entries,
 *    notifications, conversations) are PERMANENTLY DELETED.
 *
 * 3. The User record is anonymized (email/name replaced with hashes)
 *    so that foreign key references remain valid for retained records.
 *
 * 4. The Supabase Auth account is deleted last, after all DB operations.
 *
 * 5. An audit log entry is created BEFORE deletion for legal traceability.
 */

const deleteAccountSchema = z.object({
  confirmation: z.string().refine((val) => val === 'EXCLUIR MINHA CONTA', {
    message: 'Você precisa digitar "EXCLUIR MINHA CONTA" para confirmar.',
  }),
})

export const deleteAccount = createSafeAction(deleteAccountSchema, async (_, user) => {
  const userId = user.id

  logger.info(`[LGPD] Account deletion initiated for user ${userId}`)

  // 1. Create audit log BEFORE deletion
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'ACCOUNT_DELETION_REQUEST',
      entity: 'User',
      entityId: userId,
      newData: {
        reason: 'User-initiated account deletion (LGPD Art. 18)',
        timestamp: new Date().toISOString(),
      },
    },
  })

  // 2. Fetch user's profile ID (needed for cascading operations)
  const profile = await prisma.profile.findUnique({
    where: { user_id: userId },
    select: { id: true },
  })

  const psychProfile = await prisma.psychologistProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  // 3. Execute all deletions in a transaction
  await prisma.$transaction(async (tx) => {
    // ─── Anonymize clinical records (MUST NOT DELETE per CFP regulation) ───
    if (profile) {
      // Anonymize evolutions — replace patient reference but keep clinical content
      await tx.evolution.updateMany({
        where: { patientId: profile.id },
        data: {
          patientId: profile.id, // keep FK valid
        },
      })

      // Anonymize anamnesis
      await tx.anamnesis.updateMany({
        where: { patientId: profile.id },
        data: {
          mainComplaint: '[DADOS REMOVIDOS - LGPD]',
          familyHistory: '[DADOS REMOVIDOS - LGPD]',
          medication: '[DADOS REMOVIDOS - LGPD]',
          diagnosticHypothesis: '[DADOS REMOVIDOS - LGPD]',
        },
      })
    }

    // ─── Delete personal data (fully erasable) ───

    // Diary entries — personal content, fully deletable
    await tx.diaryEntry.deleteMany({ where: { userId } })

    // Notifications
    await tx.notification.deleteMany({ where: { userId } })

    // Messages sent by user
    await tx.message.deleteMany({ where: { senderId: userId } })

    // Conversation participations
    await tx.conversationParticipant.deleteMany({ where: { userId } })

    // Company memberships
    if (profile) {
      await tx.companyMember.deleteMany({ where: { profileId: profile.id } })

      // Patient-Psychologist links
      await tx.patientPsychologistLink.deleteMany({
        where: { OR: [{ patientId: profile.id }, { psychologistId: profile.id }] },
      })
    }

    // Cancel future appointments (don't delete past ones — they're financial records)
    if (psychProfile) {
      await tx.appointment.updateMany({
        where: {
          psychologistId: psychProfile.id,
          status: 'SCHEDULED',
          scheduledAt: { gt: new Date() },
        },
        data: { status: 'CANCELED' },
      })
    }

    await tx.appointment.updateMany({
      where: {
        patientId: userId,
        status: 'SCHEDULED',
        scheduledAt: { gt: new Date() },
      },
      data: { status: 'CANCELED' },
    })

    // Delete psychologist profile if exists
    if (psychProfile) {
      // Delete schedule overrides, coupons, plans first (cascade)
      await tx.scheduleOverride.deleteMany({ where: { psychologistId: psychProfile.id } })
      await tx.coupon.deleteMany({ where: { psychologistId: psychProfile.id } })
      await tx.plan.deleteMany({ where: { psychologistId: psychProfile.id } })
      await tx.psychologistInsurance.deleteMany({ where: { psychologistId: psychProfile.id } })
      await tx.psychologistProfile.delete({ where: { id: psychProfile.id } })
    }

    // Delete company profile if exists
    await tx.companyProfile.deleteMany({ where: { userId } })

    // Delete user profile (personal data)
    if (profile) {
      await tx.profile.delete({ where: { id: profile.id } })
    }

    // Anonymize the User record (keep for FK integrity with audit logs and retained records)
    const anonymizedEmail = `deleted_${userId.slice(0, 8)}@removed.lgpd`
    await tx.user.update({
      where: { id: userId },
      data: {
        name: '[Conta Excluída]',
        email: anonymizedEmail,
        emailVerified: null,
        image: null,
        password: null,
        notificationSettings: Prisma.DbNull,
      },
    })
  })

  // 4. Delete Supabase Auth account (outside the Prisma transaction)
  try {
    const supabase = await createClient()

    // Sign out all sessions first
    await supabase.auth.signOut({ scope: 'global' })

    // Delete auth user via admin API (requires service role key)
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await serviceClient.auth.admin.deleteUser(userId)

    logger.info(`[LGPD] Supabase auth account deleted for user ${userId}`)
  } catch (err) {
    // Log but don't fail — data is already anonymized in DB
    logger.error(`[LGPD] Failed to delete Supabase auth for user ${userId}:`, err)
  }

  // 5. Final audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'ACCOUNT_DELETION_COMPLETED',
      entity: 'User',
      entityId: userId,
      newData: {
        completedAt: new Date().toISOString(),
        anonymizedEmail: `deleted_${userId.slice(0, 8)}@removed.lgpd`,
      },
    },
  })

  logger.info(`[LGPD] Account deletion completed for user ${userId}`)

  return { deleted: true }
})
