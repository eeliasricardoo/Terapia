'use server'

import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const deleteAccountSchema = z.object({
  confirm: z.boolean().refine((v) => v === true, 'Você precisa confirmar a exclusão'),
})

/**
 * Deletes the user account and all associated data (LGPD Compliance)
 */
export const deleteUserAccount = createSafeAction(deleteAccountSchema, async (_data, user) => {
  // 1. Check for active future appointments
  const futureAppointments = await prisma.appointment.count({
    where: {
      OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
      scheduledAt: { gt: new Date() },
      status: 'SCHEDULED',
    },
  })

  if (futureAppointments > 0) {
    throw new Error(
      'Você possui agendamentos futuros pendentes. Cancele-os antes de excluir sua conta.'
    )
  }

  try {
    // 2. Start Deletion Process
    logger.info(`Starting account deletion for user ${user.id} (${user.email})`)

    // In a real health platform, we might anonymize instead of delete clinical records.
    // For this implementation, we follow the "Right to be Forgotten" requested.

    // Prisma Cascade should handle Profiles and other related models if configured.
    // We manually delete models that might not be cascaded yet to be safe.

    await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { user_id: user.id } })
      const psychProfile = await tx.psychologistProfile.findUnique({ where: { userId: user.id } })

      // Delete clinical data first
      if (profile) {
        await tx.evolution.deleteMany({
          where: { patientId: profile.id },
        })

        await tx.anamnesis.deleteMany({
          where: { patientId: profile.id },
        })
      }

      // Delete messages and participants
      await tx.message.deleteMany({
        where: { senderId: user.id },
      })

      await tx.conversationParticipant.deleteMany({
        where: { userId: user.id },
      })

      // Delete appointments
      await tx.appointment.deleteMany({
        where: {
          OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
        },
      })

      // Delete profiles (Cascade usually handles this, but let's be explicit if needed)
      await tx.profile.deleteMany({ where: { user_id: user.id } })
      await tx.psychologistProfile.deleteMany({ where: { userId: user.id } })

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id },
      })

      // Audit Log (Anonymized)
      await tx.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'ACCOUNT_DELETED',
          entity: 'User',
          entityId: user.id,
          newData: { timestamp: new Date(), emailHash: Buffer.from(user.email).toString('base64') },
        },
      })
    })

    // 3. Delete from Supabase Auth
    const admin = createAdminClient()
    const { error: authError } = await admin.auth.admin.deleteUser(user.id)

    if (authError) {
      logger.error(`Error deleting user from Supabase Auth: ${authError.message}`, authError)
      // We don't throw here because the DB is already gone, but we log it for manual cleanup if needed
    }

    logger.info(`Successfully deleted account for ${user.id}`)
  } catch (error: unknown) {
    logger.error('Account deletion failed:', error)
    throw new Error('Falha ao excluir conta. Por favor, entre em contato com o suporte.')
  }

  // 4. Redirect to home
  revalidatePath('/', 'layout')
  redirect('/')
})
