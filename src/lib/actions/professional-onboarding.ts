'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const saveProfessionalData = createSafeAction(
  z.instanceof(FormData),
  async (formData, user) => {
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
      specializations = JSON.parse(rawSpec || '[]')
      healthInsurances = JSON.parse(rawInsur || '[]')
    } catch {
      throw new Error('Formato de dados inválido.')
    }

    const diplomaFile = formData.get('diploma') as File | null
    const licenseFile = formData.get('license') as File | null

    const MAX_FILE_SIZE = 5 * 1024 * 1024
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

    if (diplomaFile && diplomaFile.size > 0) {
      if (diplomaFile.size > MAX_FILE_SIZE) throw new Error('O diploma deve ter no máximo 5MB')
      if (!ALLOWED_TYPES.includes(diplomaFile.type))
        throw new Error('O diploma deve ser um PDF ou imagem')
    }

    if (licenseFile && licenseFile.size > 0) {
      if (licenseFile.size > MAX_FILE_SIZE)
        throw new Error('A carteira profissional deve ter no máximo 5MB')
      if (!ALLOWED_TYPES.includes(licenseFile.type))
        throw new Error('A carteira profissional deve ser um PDF ou imagem')
    }

    const supabase = await createClient()

    // 1. Update Profile role
    await prisma.profile.update({
      where: { user_id: user.id },
      data: { role: 'PSYCHOLOGIST' },
    })

    // 2. Handle File Uploads via Supabase Storage
    let diplomaUrl = null
    let licenseUrl = null

    if (diplomaFile && diplomaFile.size > 0) {
      const { data: uploadData } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/diploma_${Date.now()}`, diplomaFile)
      if (uploadData) diplomaUrl = uploadData.path
    }

    if (licenseFile && licenseFile.size > 0) {
      const { data: uploadData } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/license_${Date.now()}`, licenseFile)
      if (uploadData) licenseUrl = uploadData.path
    }

    // 3. Upsert Psychologist Profile via Prisma
    const psych = await prisma.psychologistProfile.upsert({
      where: { userId: user.id },
      update: {
        crp: registrationNumber,
        specialties: specializations,
        university,
        academicLevel,
        title,
        crpExpiration: expirationDate ? new Date(expirationDate) : null,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        diplomaUrl: diplomaUrl || undefined,
        licenseUrl: licenseUrl || undefined,
      },
      create: {
        userId: user.id,
        crp: registrationNumber,
        specialties: specializations,
        university,
        academicLevel,
        title,
        crpExpiration: expirationDate ? new Date(expirationDate) : null,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        diplomaUrl: diplomaUrl || '',
        licenseUrl: licenseUrl || '',
      },
    })

    // 4. Link Health Insurances
    if (healthInsurances.length > 0) {
      await prisma.psychologistInsurance.deleteMany({
        where: { psychologistId: psych.id },
      })

      await prisma.psychologistInsurance.createMany({
        data: healthInsurances.map((id) => ({
          psychologistId: psych.id,
          healthInsuranceId: id,
        })),
      })
    }

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const savePaymentConfig = createSafeAction(
  z.object({
    bank: z.string(),
    accountNumber: z.string(),
    accountType: z.string(),
    taxIdType: z.string(),
    taxIdNumber: z.string(),
  }),
  async (data, user) => {
    await prisma.psychologistProfile.update({
      where: { userId: user.id },
      data: {
        bank: data.bank,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        taxIdType: data.taxIdType,
        taxIdNumber: data.taxIdNumber,
        isVerified: false, // Reset verification on payment change for safety if needed, or keep same
      },
    })

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const savePatientPreferences = createSafeAction(
  z.object({
    selectedAreas: z.array(z.string()),
    preferences: z.object({ gender: z.string(), age: z.string(), style: z.string() }),
    availability: z.object({ days: z.array(z.string()), times: z.array(z.string()) }),
    history: z.object({ previousTherapy: z.string(), medication: z.string(), bio: z.string() }),
  }),
  async (data, user) => {
    await prisma.profile.update({
      where: { user_id: user.id },
      data: {
        onboardingData: data as Prisma.InputJsonValue,
      },
    })

    revalidatePath('/busca')
    return { success: true }
  }
)
