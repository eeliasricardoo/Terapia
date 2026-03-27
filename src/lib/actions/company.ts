import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

/**
 * Link a company benefit by organization code.
 */
export const linkCompanyBenefit = createSafeAction(
  z.string().min(1),
  async (organizationCode, user) => {
    const company = await prisma.companyProfile.findUnique({
      where: { organizationCode: organizationCode.toUpperCase() },
    })

    if (!company) throw new Error('Código de empresa inválido')

    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile) throw new Error('Perfil não encontrado')

    const existingLink = await prisma.companyMember.findUnique({
      where: {
        companyId_profileId: {
          companyId: company.id,
          profileId: profile.id,
        },
      },
    })

    if (existingLink) throw new Error('Você já possui vínculo com esta empresa')

    await prisma.companyMember.create({
      data: {
        companyId: company.id,
        profileId: profile.id,
        status: 'ACTIVE',
      },
    })

    revalidatePath('/dashboard/perfil')
    return { success: true }
  }
)

/**
 * Unlink a company benefit.
 */
export const unlinkCompanyBenefit = createSafeAction(z.string().uuid(), async (companyId, user) => {
  const profile = await prisma.profile.findUnique({
    where: { user_id: user.id },
  })

  if (!profile) throw new Error('Perfil não encontrado')

  await prisma.companyMember.delete({
    where: {
      companyId_profileId: {
        companyId,
        profileId: profile.id,
      },
    },
  })

  revalidatePath('/dashboard/perfil')
  return { success: true }
})
