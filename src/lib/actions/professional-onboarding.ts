'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProfessionalData(data: {
  university: string
  academicLevel: string
  title: string
  registrationNumber: string
  expirationDate?: Date
  specializations: string[]
  yearsOfExperience: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Simulated success for saveProfessionalData (unauthenticated)')
      return { success: true }
    }
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
      console.error('Error updating profile:', profileError)
      return { success: false, error: 'Erro ao atualizar perfil básico' }
    }

    // 2. Create or Update Psychologist Profile
    const { error: psychError } = await supabase.from('psychologist_profiles').upsert(
      {
        userId: user.id,
        crp: data.registrationNumber,
        specialties: data.specializations,
        university: data.university,
        academicLevel: data.academicLevel,
        title: data.title,
        crpExpiration: data.expirationDate ? new Date(data.expirationDate).toISOString() : null,
        yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'userId' }
    )

    if (psychError) {
      console.error('Error creating psychologist profile:', psychError)
      return { success: false, error: 'Erro ao salvar dados profissionais.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
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
    if (process.env.NODE_ENV === 'development') {
      console.warn('Simulated success for savePaymentConfig (unauthenticated)')
      return { success: true }
    }
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
      console.error('Error updating payment config:', psychError)
      return { success: false, error: 'Erro ao salvar configurações de pagamento.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
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
    if (process.env.NODE_ENV === 'development') {
      console.warn('Simulated success for savePatientPreferences (unauthenticated)')
      return { success: true }
    }
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
      console.error('Error updating patient preferences:', profileError)
      return { success: false, error: 'Erro ao salvar preferências.' }
    }

    revalidatePath('/busca')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Erro interno no servidor' }
  }
}
