'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sanitizeText, sanitizeHtml } from '@/lib/security'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

const psychologistOnboardingSchema = z.object({
  fullName: z.string().min(3),
  crp: z.string().min(5),
  specialties: z.array(z.string()),
  approaches: z.array(z.string()),
  bio: z.string().min(10),
  price: z.number().min(0),
  videoUrl: z.string().url().optional().or(z.literal('')),
})

export const savePsychologistProfile = createSafeAction(
  psychologistOnboardingSchema,
  async (data, user) => {
    // SANITIZAÇÃO
    const sanitizedName = sanitizeText(data.fullName) || 'Anônimo'
    const sanitizedCrp = sanitizeText(data.crp)
    const sanitizedBio = sanitizeHtml(data.bio)
    const sanitizedVideoUrl = data.videoUrl ? sanitizeText(data.videoUrl) : null

    const allSpecialties = Array.from(new Set([...data.specialties, ...data.approaches])).map((s) =>
      sanitizeText(s)
    )

    // 1. Update Profile (Base role and name)
    await prisma.profile.update({
      where: { user_id: user.id },
      data: {
        fullName: sanitizedName,
        role: 'PSYCHOLOGIST',
      },
    })

    // 2. Upsert Psychologist Profile
    await prisma.psychologistProfile.upsert({
      where: { userId: user.id },
      update: {
        crp: sanitizedCrp,
        bio: sanitizedBio,
        specialties: allSpecialties,
        pricePerSession: data.price,
        videoPresentationUrl: sanitizedVideoUrl,
        isVerified: false,
      },
      create: {
        userId: user.id,
        crp: sanitizedCrp,
        bio: sanitizedBio,
        specialties: allSpecialties,
        pricePerSession: data.price,
        videoPresentationUrl: sanitizedVideoUrl,
        isVerified: false,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/busca')

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
