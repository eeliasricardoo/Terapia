'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { Database } from '@/lib/supabase/types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { isValidUUID } from '@/lib/security'
import {
  sendAppointmentNotifications,
  sendCancellationNotifications,
  sendRescheduleNotifications,
} from './notifications'
import { checkAppointmentConflict } from './appointments-utils'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export type SessionWithDetails = Appointment & {
  psychologist: Profile | null
  patient: Profile | null
}

export type PaginatedSessions = {
  sessions: SessionWithDetails[]
  nextCursor: string | null
  total: number
}

/**
 * Get sessions (appointments) for a user with cursor-based pagination.
 * @param userId  - The authenticated user's ID
 * @param limit   - Page size (default 20, max 50)
 * @param cursor  - ID of the last session from the previous page
 */
export async function getUserSessions(
  userId: string,
  limit: number = 20,
  cursor?: string
): Promise<PaginatedSessions> {
  try {
    const pageSize = Math.min(limit, 50) // Never load more than 50 at once

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: {
          OR: [{ patientId: userId }, { psychologist: { userId: userId } }],
        },
        include: {
          patient: { include: { profiles: true } },
          psychologist: {
            include: {
              user: { include: { profiles: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        take: pageSize + 1, // fetch one extra to detect if there's a next page
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip: 1,
            }
          : {}),
      }),
      prisma.appointment.count({
        where: {
          OR: [{ patientId: userId }, { psychologist: { userId: userId } }],
        },
      }),
    ])

    const hasNextPage = appointments.length > pageSize
    const items = hasNextPage ? appointments.slice(0, pageSize) : appointments
    const nextCursor = hasNextPage ? items[items.length - 1].id : null

    const sessions = items.map((appt) => ({
      ...appt,
      id: appt.id,
      patient_id: appt.patientId,
      psychologist_id: appt.psychologistId,
      scheduled_at: appt.scheduledAt.toISOString(),
      duration_minutes: appt.durationMinutes,
      status: appt.status,
      price: Number(appt.price),
      patient: appt.patient?.profiles ? (appt.patient.profiles as any) : null,
      psychologist: appt.psychologist?.user?.profiles
        ? (appt.psychologist.user.profiles as any)
        : null,
    })) as unknown as SessionWithDetails[]

    return { sessions, nextCursor, total }
  } catch (error) {
    logger.error('Error fetching user sessions (Prisma):', error)
    return { sessions: [], nextCursor: null, total: 0 }
  }
}

/**
 * Get the next upcoming session for a user
 */
export async function getNextSession(userId: string): Promise<SessionWithDetails | null> {
  const now = new Date()

  try {
    const appt = await prisma.appointment.findFirst({
      where: {
        OR: [{ patientId: userId }, { psychologist: { userId: userId } }],
        scheduledAt: { gte: now },
        status: 'SCHEDULED',
      },
      include: {
        patient: { include: { profiles: true } },
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    if (!appt) return null

    return {
      ...appt,
      scheduled_at: appt.scheduledAt.toISOString(),
      price: Number(appt.price),
      patient: appt.patient?.profiles ? (appt.patient.profiles as any) : null,
      psychologist: appt.psychologist?.user?.profiles
        ? (appt.psychologist.user.profiles as any)
        : null,
    } as unknown as SessionWithDetails
  } catch (error) {
    logger.error('Error fetching next session (Prisma):', error)
    return null
  }
}

/**
 * Get session history for a user
 */
export async function getSessionHistory(
  userId: string,
  limit: number = 10
): Promise<SessionWithDetails[]> {
  const now = new Date()

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ patientId: userId }, { psychologist: { userId: userId } }],
        scheduledAt: { lte: now },
      },
      include: {
        patient: { include: { profiles: true } },
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
    })

    return appointments.map((appt) => ({
      ...appt,
      scheduled_at: appt.scheduledAt.toISOString(),
      status: appt.status,
      price: Number(appt.price),
      patient: appt.patient?.profiles ? (appt.patient.profiles as any) : null,
      psychologist: appt.psychologist?.user?.profiles
        ? (appt.psychologist.user.profiles as any)
        : null,
    })) as unknown as SessionWithDetails[]
  } catch (error) {
    logger.error('Error fetching session history (Prisma):', error)
    return []
  }
}

/**
 * Create a new session (appointment)
 */
export async function createSession(data: {
  patientId: string
  psychologistId: string
  scheduledAt: string
  durationMinutes: number
  // We remove the price parameter from client-side control to prevent price manipulation attacks
}) {
  const supabase = await createClient()

  // 1. Verify Authentication (Defense in Depth)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Prevent User Spoofing
  if (user.id !== data.patientId && user.id !== data.psychologistId) {
    return { success: false, error: 'Acesso negado. Você não pode agendar para terceiros.' }
  }

  // 3. Security: Fetch profile and price securely from the backend
  const { data: psychData, error: psychError } = await supabase
    .from('psychologist_profiles')
    .select('id, price_per_session')
    .eq('userId', data.psychologistId)
    .single()

  if (psychError || !psychData) {
    logger.error('Error fetching psychologist data:', psychError)
    return { success: false, error: 'Psicólogo não encontrado ou erro ao obter dados.' }
  }

  const psychologistProfileId = psychData.id
  const securePrice = psychData.price_per_session || 0

  // 4. Backend validation: Prevent double booking
  try {
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId,
      patientId: data.patientId,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
    })

    if (hasConflict) {
      return {
        success: false,
        error:
          type === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.',
      }
    }
  } catch (err) {
    logger.error('Conflict check error in createSession:', err)
    // We proceed if there's a technical error, or fail safe?
    // Let's fail safe if we can't be sure
    return { success: false, error: 'Erro ao verificar disponibilidade.' }
  }

  // 5. Create the appointment
  try {
    const newSession = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        psychologistId: psychologistProfileId,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes,
        price: securePrice,
        status: 'SCHEDULED',
      },
    })

    // Send notifications asynchronously
    sendAppointmentNotifications(newSession.id).catch((err) =>
      logger.error('Error sending session notifications:', err)
    )

    revalidateTag('appointments')
    revalidatePath('/', 'layout')

    return {
      success: true,
      data: {
        ...newSession,
        scheduled_at: newSession.scheduledAt.toISOString(),
        duration_minutes: newSession.durationMinutes,
        price: Number(newSession.price),
      },
    }
  } catch (error: any) {
    logger.error('Error creating session:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cancel a session
 */
export async function cancelSession(sessionId: string) {
  if (!isValidUUID(sessionId)) {
    return { success: false, error: 'ID de sessão inválido' }
  }

  const supabase = await createClient()

  // 1. Verify Authentication (Defense in Depth)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Security: Verify Ownership Before Canceling
  // We check if the current user is either the patient or the psychologist for this specific appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: sessionId },
    select: { patientId: true, psychologist: { select: { userId: true } } },
  })

  if (!appointment) {
    return { success: false, error: 'Sessão não encontrada' }
  }

  if (user.id !== appointment.patientId && user.id !== appointment.psychologist?.userId) {
    // Log this attempt as it could be an attack
    logger.warn(`UNAUTHORIZED CANCEL ATTEMPT: User ${user.id} tried to cancel session ${sessionId}`)
    return {
      success: false,
      error: 'Acesso negado. Você não tem permissão para cancelar esta sessão.',
    }
  }

  // 3. Execute cancellation
  try {
    await prisma.appointment.update({
      where: { id: sessionId },
      data: { status: 'CANCELED' },
    })
  } catch (error: any) {
    logger.error('Error cancelling session:', error)
    return { success: false, error: error.message || 'Erro ao cancelar sessão' }
  }

  // Send notification to the other party
  sendCancellationNotifications(sessionId, user.id).catch((err) =>
    logger.error('Error sending cancellation notifications:', err)
  )

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true }
}

/**
 * Reschedule a session
 */
export async function rescheduleSession(data: { sessionId: string; newScheduledAt: string }) {
  if (!isValidUUID(data.sessionId)) {
    return { success: false, error: 'ID de sessão inválido' }
  }

  const supabase = await createClient()

  // 1. Verify Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Security: Verify Ownership & Session Info
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.sessionId },
    select: {
      patientId: true,
      psychologistId: true,
      scheduledAt: true,
      durationMinutes: true,
      psychologist: { select: { userId: true } },
    },
  })

  if (!appointment) {
    return { success: false, error: 'Sessão não encontrada' }
  }

  if (user.id !== appointment.patientId && user.id !== appointment.psychologist?.userId) {
    return {
      success: false,
      error: 'Acesso negado. Você não tem permissão para reagendar esta sessão.',
    }
  }

  // 3. Prevent rescheduling past sessions
  if (appointment.scheduledAt < new Date()) {
    // Optional: Allow psychologists to reschedule past sessions if needed?
    // Usually patients can't reschedule after the time has passed.
    if (user.id === appointment.patientId) {
      return {
        success: false,
        error: 'Não é possível reagendar uma sessão que já ocorreu ou está em andamento.',
      }
    }
  }

  // 4. Backend validation: Prevent double booking
  try {
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId: appointment.psychologistId,
      patientId: appointment.patientId,
      scheduledAt: new Date(data.newScheduledAt),
      durationMinutes: appointment.durationMinutes,
      excludeAppointmentId: data.sessionId,
    })

    if (hasConflict) {
      return {
        success: false,
        error:
          type === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.',
      }
    }
  } catch (error: any) {
    logger.error('Reschedule conflict check error:', {
      psychId: appointment.psychologistId,
      sessionId: data.sessionId,
      error: error.message || error,
    })
    return {
      success: false,
      error: 'Ocorreu um erro ao verificar disponibilidade do novo horário.',
    }
  }

  // 5. Update the appointment
  const previousDate = appointment.scheduledAt

  try {
    const updatedSession = await prisma.appointment.update({
      where: { id: data.sessionId },
      data: {
        scheduledAt: new Date(data.newScheduledAt),
        status: 'SCHEDULED',
      },
    })

    // Send notification to the other party
    sendRescheduleNotifications(data.sessionId, user.id, previousDate).catch((err) =>
      logger.error('Error sending reschedule notifications:', err)
    )

    revalidateTag('appointments')
    revalidatePath('/', 'layout')

    return {
      success: true,
      data: {
        ...updatedSession,
        scheduled_at: updatedSession.scheduledAt.toISOString(),
        duration_minutes: updatedSession.durationMinutes,
        price: Number(updatedSession.price),
      },
    }
  } catch (updateError: any) {
    logger.error('Error rescheduling session:', updateError)
    return { success: false, error: updateError.message || 'Erro ao reagendar' }
  }
}

/**
 * Get session summary with evolution notes
 */
export async function getSessionSummary(sessionId: string) {
  if (!isValidUUID(sessionId)) {
    return null
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch appointment with strictly typed Prisma relations
  const appointment = await prisma.appointment.findUnique({
    where: { id: sessionId },
    include: {
      psychologist: {
        include: { user: { include: { profiles: true } } },
      },
      patient: {
        include: { profiles: true },
      },
    },
  })

  if (!appointment) return null

  // Verify ownership
  if (user.id !== appointment.patientId && user.id !== appointment.psychologist.userId) {
    return null
  }

  // To get the evolution correctly filtered (evolution.patientId maps to Profile.id, not User.id)
  const patientProfileId = appointment.patient?.profiles?.id
  const evolution = patientProfileId
    ? await prisma.evolution.findFirst({
        where: {
          patientId: patientProfileId,
          psychologistId: appointment.psychologistId,
        },
        orderBy: { date: 'desc' },
      })
    : null

  const psychName =
    appointment.psychologist.user.profiles?.fullName ||
    appointment.psychologist.user.name ||
    'Especialista'

  return {
    id: appointment.id,
    durationMinutes: appointment.durationMinutes,
    scheduledAt: appointment.scheduledAt.toISOString(),
    status: appointment.status,
    psychologistName: psychName,
    specialty: appointment.psychologist.specialties?.[0] || 'Psicologia',
    publicSummary: evolution?.publicSummary || null,
    mood: evolution?.mood || null,
  }
}
