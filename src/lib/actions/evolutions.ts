'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { decryptData, encryptData, assertValidUUID } from '@/lib/security'
import { revalidatePath } from 'next/cache'

import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type PublicEvolution = {
  id: string
  date: string
  psychologistName: string
  publicSummary: string | null
  mood: string | null
}

const createEvolutionSchema = z.object({
  appointmentId: z.string().uuid('ID do agendamento inválido'),
  mood: z.string().nullable(),
  publicSummary: z.string().min(1, 'Resumo público é obrigatório'),
  privateNotes: z.string().min(1, 'Notas privadas são obrigatórias'),
})

export const createSessionEvolution = createSafeAction(
  createEvolutionSchema,
  async (data, user) => {
    // 1. Fetch appointment to get patient and psych info
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        psychologist: true,
        patient: {
          include: { profiles: true },
        },
      },
    })

    if (!appointment) throw new Error('Agendamento não encontrado')

    // 2. Security: Verify psychologist ownership
    if (appointment.psychologist.userId !== user.id) {
      throw new Error('Você não tem permissão para registrar evoluções para esta sessão.')
    }

    // 3. Get Patient Profile ID
    const patientProfileId = appointment.patient.profiles?.id
    if (!patientProfileId) {
      throw new Error('Perfil do paciente não encontrado.')
    }

    // 4. Encrypt sensitive health data
    const encryptedPublic = encryptData(data.publicSummary)
    const encryptedPrivate = encryptData(data.privateNotes)

    // 5. Create Evolution record
    const evolution = await prisma.evolution.create({
      data: {
        patientId: patientProfileId,
        psychologistId: appointment.psychologistId,
        mood: data.mood,
        publicSummary: encryptedPublic,
        privateNotes: encryptedPrivate,
        date: new Date(),
      },
    })

    // 6. Optionally update appointment status to COMPLETED
    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { status: 'COMPLETED' },
    })

    revalidatePath(`/dashboard/psicologo/pacientes/${patientProfileId}`)

    return { id: evolution.id }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export async function getPatientPublicEvolutions(): Promise<PublicEvolution[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Não autenticado')
    }

    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    })

    if (!profile) return []

    const evolutions = await prisma.evolution.findMany({
      where: {
        patientId: profile.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

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
