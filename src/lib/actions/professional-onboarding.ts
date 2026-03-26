'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'

export async function saveProfessionalData(formData: FormData) {
  const university = formData.get('university') as string
  const academicLevel = formData.get('academicLevel') as string
  const title = formData.get('title') as string
  const registrationNumber = formData.get('registrationNumber') as string
  const expirationDate = formData.get('expirationDate') as string | null
  const yearsOfExperience = formData.get('yearsOfExperience') as string

  let specializations: string[] = []
  let healthInsurances: string[] = []
  try {
    const rawSpec = formData.get('specializations') as string
    const rawInsur = formData.get('healthInsurances') as string
    const parsedSpec = JSON.parse(rawSpec || '[]')
    const parsedInsur = JSON.parse(rawInsur || '[]')
    if (Array.isArray(parsedSpec)) specializations = parsedSpec.filter((x) => typeof x === 'string')
    if (Array.isArray(parsedInsur))
      healthInsurances = parsedInsur.filter((x) => typeof x === 'string')
  } catch {
    return { success: false, error: 'Formato de dados inválido.' }
  }
  const diplomaFile = formData.get('diploma') as File | null
  const licenseFile = formData.get('license') as File | null
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    // 1. Update Profile (Base role)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'PSYCHOLOGIST',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (profileError) {
      logger.error('Error updating profile:', profileError)
      return { success: false, error: 'Erro ao atualizar perfil básico' }
    }

    // 3. Handle File Uploads
    let diplomaUrl = null
    let licenseUrl = null

    if (diplomaFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/diploma_${Date.now()}`, diplomaFile)
      if (uploadData) diplomaUrl = uploadData.path
    }

    if (licenseFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/license_${Date.now()}`, licenseFile)
      if (uploadData) licenseUrl = uploadData.path
    }

    // 4. Create or Update Psychologist Profile
    const { data: psychData, error: psychError } = await supabase
      .from('psychologist_profiles')
      .upsert(
        {
          userId: user.id,
          crp: registrationNumber,
          specialties: specializations,
          university,
          academicLevel,
          title,
          crpExpiration: expirationDate ? new Date(expirationDate).toISOString() : null,
          yearsOfExperience: parseInt(yearsOfExperience) || 0,
          diploma_url: diplomaUrl,
          license_url: licenseUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'userId' }
      )
      .select('id')
      .single()

    if (psychError) {
      logger.error('Error creating psychologist profile:', psychError)
      return { success: false, error: 'Erro ao salvar dados profissionais.' }
    }

    // 5. Link Health Insurances
    if (healthInsurances && healthInsurances.length > 0) {
      try {
        // Delete existing links first to avoid duplicates or outdated info
        await supabase.from('psychologist_insurances').delete().eq('psychologist_id', psychData.id)

        const insuranceLinks = healthInsurances.map((insuranceId: string) => ({
          psychologist_id: psychData.id,
          health_insurance_id: insuranceId,
        }))

        const { error: linkError } = await supabase
          .from('psychologist_insurances')
          .insert(insuranceLinks)

        if (linkError) {
          logger.error('Error linking health insurances:', linkError)
          // We don't return error here because the main profile was saved,
          // but we should probably log it.
        }
      } catch (linkCatchError) {
        logger.error('Unexpected error linking health insurances:', linkCatchError)
      }
    }

    return { success: true }
  } catch (error) {
    logger.error('Unexpected error:', error)
    return { success: false, error: 'Erro interno no servidor' }
  }
}

export async function savePaymentConfig(data: {
  bank: string
  accountNumber: string
  accountType: string
  taxIdType: string
  taxIdNumber: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    const { error: psychError } = await supabase
      .from('psychologist_profiles')
      .update({
        bank: data.bank,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        taxIdType: data.taxIdType,
        taxIdNumber: data.taxIdNumber,
        video_presentation_url: '',
        is_verified: false, // Must be approved by an Admin
        updated_at: new Date().toISOString(),
      })
      .eq('userId', user.id)

    if (psychError) {
      logger.error('Error updating payment config:', psychError)
      return { success: false, error: 'Erro ao salvar configurações de pagamento.' }
    }

    return { success: true }
  } catch (error) {
    logger.error('Unexpected error:', error)
    return { success: false, error: 'Erro interno no servidor' }
  }
}

export async function savePatientPreferences(data: {
  selectedAreas: string[]
  preferences: { gender: string; age: string; style: string }
  availability: { days: string[]; times: string[] }
  history: { previousTherapy: string; medication: string; bio: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_data: data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (profileError) {
      logger.error('Error updating patient preferences:', profileError)
      return { success: false, error: 'Erro ao salvar preferências.' }
    }

    revalidatePath('/busca')
    return { success: true }
  } catch (error) {
    logger.error('Unexpected error:', error)
    return { success: false, error: 'Erro interno no servidor' }
  }
}
