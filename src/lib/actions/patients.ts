'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { encryptData, decryptData, isValidUUID } from '@/lib/security'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Type representing a patient from the DB merged with required UI fields
export type PatientData = {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  image?: string
  status: 'active' | 'inactive' | 'archived'
  lastSession?: string
  nextSession?: string
  totalSessions: number
  gender?: string
  profession?: string
  address?: {
    line?: string
    city?: string
    state?: string
    zip?: string
  }
  document?: string
  birthDate?: string
}

export const getPsychologistPatients = createSafeAction(
  z.any().optional(),
  async (_, user) => {
    // 1. Find psychologist profile ID
    const psychologistProfile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psychologistProfile) {
      return []
    }

    // 2. Fetch data in parallel
    const [appointments, explicitLinks] = await Promise.all([
      prisma.appointment.findMany({
        where: { psychologistId: psychologistProfile.id },
        include: {
          patient: {
            include: { profiles: true },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 200,
      }),
      prisma.patientPsychologistLink.findMany({
        where: { psychologistId: psychologistProfile.id },
        include: {
          patient: {
            include: { users: true },
          },
        },
      }),
    ])

    type AppointmentWithPatient = (typeof appointments)[0]
    type ProfileType = NonNullable<AppointmentWithPatient['patient']['profiles']>
    type UserType = AppointmentWithPatient['patient']

    type PatientMapEntry = {
      user: UserType | Record<string, unknown>
      profile: ProfileType | Record<string, unknown>
      appointments: AppointmentWithPatient[]
      status: string
    }
    const patientsMap = new Map<string, PatientMapEntry>()

    for (const appt of appointments) {
      const patientId = appt.patientId
      const profile = appt.patient.profiles
      if (!profile) continue
      if (!patientsMap.has(patientId)) {
        patientsMap.set(patientId, {
          user: appt.patient,
          profile: profile,
          appointments: [],
          status: 'active',
        })
      }
      patientsMap.get(patientId)!.appointments.push(appt)
    }

    for (const link of explicitLinks) {
      const patientId = link.patient.user_id
      if (patientsMap.has(patientId)) {
        patientsMap.get(patientId)!.status = link.status
      } else {
        patientsMap.set(patientId, {
          user: link.patient.users,
          profile: link.patient,
          appointments: [],
          status: link.status,
        })
      }
    }

    const now = new Date()
    return Array.from(patientsMap.values()).map((data) => {
      const { user, profile, appointments: appts, status } = data
      const sortedAppts = [...appts].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      const pastAppts = sortedAppts.filter((a) => new Date(a.scheduledAt) < now)
      const futureAppts = sortedAppts.filter((a) => new Date(a.scheduledAt) >= now)

      const lastSession =
        pastAppts.length > 0 ? pastAppts[pastAppts.length - 1].scheduledAt : undefined
      const nextSession = futureAppts.length > 0 ? futureAppts[0].scheduledAt : undefined

      const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)

      const p = profile as Record<string, unknown>
      const u = user as Record<string, unknown>
      return {
        id: p.id as string,
        userId: u.id as string,
        name: (p.fullName || u.name || 'Paciente') as string,
        email: u.email as string,
        phone: (p.phone || '') as string,
        image: ((p.avatarUrl || u.image) as string | null) || undefined,
        status: status as 'active' | 'inactive' | 'archived',
        totalSessions: appts.length,
        lastSession: lastSession ? formatDate(lastSession) : undefined,
        nextSession: nextSession ? formatDate(nextSession) : undefined,
        gender: (p.gender || '') as string,
        profession: (p.profession || '') as string,
        document: (p.document || '') as string,
        birthDate: p.birth_date ? new Date(p.birth_date as string).toLocaleDateString('pt-BR') : '',
        address: {
          line: (p.addressLine || '') as string,
          city: (p.city || '') as string,
          state: (p.state || '') as string,
          zip: (p.zipCode || '') as string,
        },
      }
    })
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const getPatientInfoByAppointment = createSafeAction(
  z.string().uuid(),
  async (appointmentId, user) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { profiles: true },
        },
        psychologist: true,
      },
    })

    if (!appointment) return null

    // Verify psychologist
    if (appointment.psychologist.userId !== user.id) {
      throw new Error('Sem permissão para acessar este agendamento.')
    }

    const profile = appointment.patient.profiles
    if (!profile) return null

    const patientUser = appointment.patient

    return {
      id: profile.id,
      userId: patientUser.id,
      name: profile.fullName || patientUser.name || 'Paciente',
      email: patientUser.email,
      phone: profile.phone || '',
      image: profile.avatarUrl || patientUser.image || undefined,
      status: 'active',
      totalSessions: 0,
      gender: profile.gender || '',
      profession: profile.profession || '',
      document: profile.document || '',
      birthDate: profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : '',
      address: {
        line: profile.addressLine || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zipCode || '',
      },
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const getPatientById = createSafeAction(
  z.string().uuid(),
  async (profileId, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) return null

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { users: true },
    })
    if (!profile) return null

    const [appointments, link] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          patientId: profile.user_id,
          psychologistId: psych.id,
        },
        select: { id: true, scheduledAt: true, status: true },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.patientPsychologistLink.findUnique({
        where: {
          patientId_psychologistId: {
            patientId: profileId,
            psychologistId: psych.id,
          },
        },
      }),
    ])

    // Verify access
    if (appointments.length === 0 && !link) {
      throw new Error('Você não tem permissão para acessar este paciente.')
    }

    const now = new Date()
    const pastAppts = appointments.filter((a) => a.scheduledAt < now)
    const futureAppts = appointments.filter((a) => a.scheduledAt >= now)

    const lastSession =
      pastAppts.length > 0 ? pastAppts[pastAppts.length - 1].scheduledAt : undefined
    const nextSession = futureAppts.length > 0 ? futureAppts[0].scheduledAt : undefined

    const formatDate = (date: Date) =>
      new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)

    return {
      id: profile.id,
      userId: profile.users.id,
      name: profile.fullName || profile.users.name || 'Paciente',
      email: profile.users.email,
      phone: profile.phone || '',
      image: profile.avatarUrl || profile.users.image || undefined,
      status: (link?.status ?? 'active') as 'active' | 'inactive' | 'archived',
      totalSessions: appointments.length,
      lastSession: lastSession ? formatDate(lastSession) : undefined,
      nextSession: nextSession ? formatDate(nextSession) : undefined,
      gender: profile.gender || '',
      profession: profile.profession || '',
      document: profile.document || '',
      birthDate: profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : '',
      address: {
        line: profile.addressLine || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zipCode || '',
      },
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export type AnamnesisData = {
  id?: string
  mainComplaint?: string
  familyHistory?: string
  medication?: string
  diagnosticHypothesis?: string
}

const anamnesisSchema = z.object({
  mainComplaint: z.string().optional(),
  familyHistory: z.string().optional(),
  medication: z.string().optional(),
  diagnosticHypothesis: z.string().optional(),
})

export const updateAnamnesis = createSafeAction(
  z.object({
    patientProfileId: z.string().uuid(),
    data: anamnesisSchema,
  }),
  async (input, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) throw new Error('Psicólogo não encontrado')

    // 1. Verify link exists (Data Isolation)
    const link = await prisma.patientPsychologistLink.findFirst({
      where: {
        patientId: input.patientProfileId,
        psychologistId: psych.id,
      },
    })

    if (!link) {
      const profile = await prisma.profile.findUnique({ where: { id: input.patientProfileId } })
      if (!profile) throw new Error('Paciente não encontrado')

      const appt = await prisma.appointment.findFirst({
        where: {
          patientId: profile.user_id,
          psychologistId: psych.id,
        },
      })
      if (!appt) throw new Error('Você não tem permissão para editar este paciente.')
    }

    // 2. Upsert Anamnesis
    const existing = await prisma.anamnesis.findFirst({
      where: {
        patientId: input.patientProfileId,
        psychologistId: psych.id,
      },
    })

    const payload = {
      mainComplaint: encryptData(input.data.mainComplaint || ''),
      familyHistory: encryptData(input.data.familyHistory || ''),
      medication: encryptData(input.data.medication || ''),
      diagnosticHypothesis: encryptData(input.data.diagnosticHypothesis || ''),
    }

    if (existing) {
      return await prisma.anamnesis.update({
        where: { id: existing.id },
        data: payload,
      })
    } else {
      return await prisma.anamnesis.create({
        data: {
          ...payload,
          patientId: input.patientProfileId,
          psychologistId: psych.id,
        },
      })
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const getAnamnesis = createSafeAction(
  z.string().uuid(),
  async (patientProfileId, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) return null

    const anamnesis = await prisma.anamnesis.findFirst({
      where: {
        patientId: patientProfileId,
        psychologistId: psych.id,
      },
    })

    if (!anamnesis) return null

    return {
      id: anamnesis.id,
      mainComplaint: decryptData(anamnesis.mainComplaint || ''),
      familyHistory: decryptData(anamnesis.familyHistory || ''),
      medication: decryptData(anamnesis.medication || ''),
      diagnosticHypothesis: decryptData(anamnesis.diagnosticHypothesis || ''),
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

// ─── Evolutions ─────────────────────────────────────────────────────────────

export type EvolutionData = {
  id: string
  date: string
  mood?: string
  publicSummary?: string
  privateNotes?: string
}

export const getEvolutions = createSafeAction(
  z.string().uuid(),
  async (patientProfileId, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) return []

    const evolutions = await prisma.evolution.findMany({
      where: { patientId: patientProfileId, psychologistId: psych.id },
      orderBy: { date: 'desc' },
      take: 10,
    })

    return evolutions.map((e) => ({
      id: e.id,
      date: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(e.date)),
      mood: e.mood || undefined,
      publicSummary: decryptData(e.publicSummary || ''),
      privateNotes: decryptData(e.privateNotes || ''),
    }))
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

// ─── Session History ─────────────────────────────────────────────────────────

export type SessionHistoryItem = {
  id: string
  scheduledAt: string
  endTime: string
  status: string
  price: string
  psychologistName: string
}

export const getPatientSessionHistory = createSafeAction(
  z.string().uuid(),
  async (patientProfileId, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) return []

    const profile = await prisma.profile.findUnique({
      where: { id: patientProfileId },
      include: { users: true },
    })
    if (!profile) return []

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: profile.user_id,
        psychologistId: psych.id,
      },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
      include: {
        psychologist: {
          include: { user: true },
        },
      },
    })

    const formatDate = (d: Date) =>
      new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)

    const formatTime = (d: Date) =>
      new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d)

    return appointments.map((appt) => {
      const start = new Date(appt.scheduledAt)
      const end = new Date(start.getTime() + appt.durationMinutes * 60 * 1000)
      return {
        id: appt.id,
        scheduledAt: `${formatDate(start)}`,
        endTime: `${formatTime(start)} - ${formatTime(end)}`,
        status: appt.status,
        price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          Number(appt.price)
        ),
        psychologistName: appt.psychologist.user.name || 'Psicólogo',
      }
    })
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const saveEvolution = createSafeAction(
  z.object({
    patientId: z.string().uuid(),
    mood: z.string().optional(),
    publicSummary: z.string().optional(),
    privateNotes: z.string().optional(),
  }),
  async (input, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })
    if (!psych) throw new Error('Não autorizado')

    const evolution = await prisma.evolution.create({
      data: {
        patientId: input.patientId,
        psychologistId: psych.id,
        mood: input.mood,
        publicSummary: encryptData(input.publicSummary || ''),
        privateNotes: encryptData(input.privateNotes || ''),
        date: new Date(),
      },
    })

    revalidatePath(`/dashboard/pacientes/${input.patientId}`)
    return { success: true, id: evolution.id }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
