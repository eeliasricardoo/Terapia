'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'

export async function linkCompanyBenefit(organizationCode: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Find company by organization code
    const company = await prisma.companyProfile.findUnique({
      where: { organizationCode: organizationCode.toUpperCase() },
    })

    if (!company) {
      return { success: false, error: 'Código de empresa inválido' }
    }

    // Find user profile
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile) {
      return { success: false, error: 'Perfil não encontrado' }
    }

    // Check if already linked
    const existingLink = await prisma.companyMember.findUnique({
      where: {
        companyId_profileId: {
          companyId: company.id,
          profileId: profile.id,
        },
      },
    })

    if (existingLink) {
      return { success: false, error: 'Você já possui vínculo com esta empresa' }
    }

    // Create link
    await prisma.companyMember.create({
      data: {
        companyId: company.id,
        profileId: profile.id,
        status: 'ACTIVE',
      },
    })

    revalidatePath('/dashboard/perfil')
    return { success: true }
  } catch (error: any) {
    logger.error('Error linking company benefit:', error)
    return { success: false, error: error.message || 'Erro ao vincular benefício' }
  }
}

export async function unlinkCompanyBenefit(companyId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile) return { success: false, error: 'Perfil não encontrado' }

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
  } catch (error: any) {
    logger.error('Error unlinking company benefit:', error)
    return { success: false, error: error.message || 'Erro ao remover vínculo' }
  }
}
