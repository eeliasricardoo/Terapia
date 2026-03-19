'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'

export async function getCompanyProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('company_profiles')
    .select('*, members(count)')
    .eq('user_id', user.id)
    .single()

  if (error) {
    logger.error('Error fetching company profile:', error)
    return null
  }

  return profile
}

export async function getCompanyMembers() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // First get company id
  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) return []

  const { data: members, error } = await supabase
    .from('company_members')
    .select(
      `
      id,
      status,
      joined_at,
      profile:profiles (
        full_name,
        avatar_url,
        phone,
        profession
      )
    `
    )
    .eq('company_id', company.id)

  if (error) {
    logger.error('Error fetching company members:', error)
    return []
  }

  return members
}

export async function updateCompanyBenefit(config: Record<string, unknown>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('company_profiles')
    .update({ benefit_config: config })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/empresa/perfil')
  return { success: true }
}

export async function inviteEmployee(email: string) {
  const supabase = await createClient()
  // Logic to generate token and save (could be in a new table company_invites)
  // For now just simulation or use company_members with PENDING status if email matches a user

  // Implementation details would go here
  return { success: true, message: 'Convite enviado com sucesso!' }
}
