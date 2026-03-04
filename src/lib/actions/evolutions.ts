import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { decryptData } from '@/lib/security'

export type PublicEvolution = {
  id: string
  date: string
  psychologistName: string
  publicSummary: string | null
  mood: string | null
}

export async function getPatientPublicEvolutions(): Promise<PublicEvolution[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Não autenticado')
    }

    // Find the patient's profile
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile) return []

    const evolutions = await prisma.evolution.findMany({
      where: {
        patientId: profile.id,
      },
      include: {
        // We need to get psychologist name.
        // In this schema, Evolution.psychologistId is a string.
        // Let's check if we can join it or if we need to fetch separately.
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Since psychologistId in Evolution doesn't have an explicit relation in the model shown,
    // we might need to fetch psychologist details separately or fix the schema later.
    // For now, let's fetch unique psychologist ids from results.
    const psychIds = [...new Set(evolutions.map((e) => e.psychologistId))]
    const psychologists = await prisma.psychologistProfile.findMany({
      where: { id: { in: psychIds } },
      include: { user: true },
    })

    const psychMap = new Map(psychologists.map((p) => [p.id, p.user.name]))

    return evolutions.map((ev) => ({
      id: ev.id,
      date: ev.date.toISOString(),
      psychologistName: psychMap.get(ev.psychologistId) || 'Psicólogo',
      publicSummary: ev.publicSummary ? decryptData(ev.publicSummary) : null,
      mood: ev.mood,
    }))
  } catch (error) {
    logger.error('Error fetching patient public evolutions:', error)
    return []
  }
}
