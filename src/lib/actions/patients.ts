'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

// Type representing a patient from the DB merged with required UI fields
export type PatientData = {
    id: string
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

export async function getPsychologistPatients(): Promise<PatientData[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('Não autenticado')
        }

        // Find psychologist profile ID
        const psychologistProfile = await prisma.psychologistProfile.findUnique({
            where: { userId: user.id }
        })

        if (!psychologistProfile) {
            return []
        }

        // Get all appointments where this user is the psychologist
        const appointments = await prisma.appointment.findMany({
            where: {
                psychologistId: psychologistProfile.id,
            },
            include: {
                patient: {
                    include: {
                        profiles: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        })

        // Also get explicit links (if they were created directly without appointments)
        const explicitLinks = await prisma.patientPsychologistLink.findMany({
            where: { psychologistId: psychologistProfile.id },
            include: {
                patient: {
                    include: {
                        users: true
                    }
                }
            }
        })

        // Combine unique patients
        const patientsMap = new Map<string, any>()

        // Process appointments
        for (const appt of appointments) {
            const patientId = appt.patientId
            const profile = appt.patient.profiles

            if (!profile) continue

            if (!patientsMap.has(patientId)) {
                patientsMap.set(patientId, {
                    user: appt.patient,
                    profile: profile,
                    appointments: [],
                    status: 'active' // default
                })
            }

            patientsMap.get(patientId).appointments.push(appt)
        }

        // Process explicit links (updates status if exists, or adds new patient)
        for (const link of explicitLinks) {
            const patientId = link.patient.user_id
            if (patientsMap.has(patientId)) {
                patientsMap.get(patientId).status = link.status
                patientsMap.get(patientId).linkId = link.id
            } else {
                patientsMap.set(patientId, {
                    user: link.patient.users,
                    profile: link.patient,
                    appointments: [],
                    status: link.status,
                    linkId: link.id
                })
            }
        }

        const now = new Date()
        const patientDataList: PatientData[] = []

        // Format to PatientData
        for (const [_, data] of Array.from(patientsMap.entries())) {
            const { user, profile, appointments, status } = data

            // Sort appointments
            const sortedAppts = [...appointments].sort((a, b) =>
                new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            )

            const pastAppts = sortedAppts.filter(a => new Date(a.scheduledAt) < now)
            const futureAppts = sortedAppts.filter(a => new Date(a.scheduledAt) >= now)

            const lastSession = pastAppts.length > 0 ? Object.assign(pastAppts[pastAppts.length - 1]).scheduledAt : undefined
            const nextSession = futureAppts.length > 0 ? Object.assign(futureAppts[0]).scheduledAt : undefined

            // Formatting dates manually avoiding heavy libs like date-fns if not necessary,
            // or just passing the ISO string to format on client side
            const formatDate = (date: Date) => {
                return new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }).format(date)
            }

            patientDataList.push({
                id: profile.id, // Using profile ID to match Prisma's relation type easily
                name: profile.fullName || user.name || 'Paciente',
                email: user.email,
                phone: profile.phone || '',
                image: profile.avatarUrl || user.image || undefined,
                status: status as 'active' | 'inactive' | 'archived',
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
                    zip: profile.zipCode || ''
                }
            })
        }

        return patientDataList
    } catch (error) {
        logger.error('Error fetching psychologist patients:', error)
        return []
    }
}

export type AnamnesisData = {
    id?: string
    mainComplaint?: string
    familyHistory?: string
    medication?: string
    diagnosticHypothesis?: string
}

export async function getAnamnesis(patientProfileId: string): Promise<AnamnesisData | null> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('Não autenticado')
        }

        // Verify psychologist has this patient
        const psychologistProfile = await prisma.psychologistProfile.findUnique({
            where: { userId: user.id }
        })

        if (!psychologistProfile) {
            throw new Error('Perfil de psicólogo não encontrado')
        }

        const anamnesis = await prisma.anamnesis.findFirst({
            where: {
                patientId: patientProfileId,
                psychologistId: psychologistProfile.id
            }
        })

        if (!anamnesis) {
            return null
        }

        return {
            id: anamnesis.id,
            mainComplaint: anamnesis.mainComplaint || '',
            familyHistory: anamnesis.familyHistory || '',
            medication: anamnesis.medication || '',
            diagnosticHypothesis: anamnesis.diagnosticHypothesis || ''
        }
    } catch (error) {
        logger.error('Error fetching anamnesis:', error)
        return null
    }
}

// ─── Evolutions ─────────────────────────────────────────────────────────────

export type EvolutionData = {
    id: string
    date: string
    mood?: string
    publicSummary?: string
    privateNotes?: string
}

export async function getEvolutions(patientProfileId: string): Promise<EvolutionData[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const psychologistProfile = await prisma.psychologistProfile.findUnique({ where: { userId: user.id } })
        if (!psychologistProfile) return []

        const evolutions = await prisma.evolution.findMany({
            where: { patientId: patientProfileId, psychologistId: psychologistProfile.id },
            orderBy: { date: 'desc' },
            take: 10
        })

        return evolutions.map(e => ({
            id: e.id,
            date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(e.date)),
            mood: e.mood || undefined,
            publicSummary: e.publicSummary || undefined,
            privateNotes: e.privateNotes || undefined,
        }))
    } catch (error) {
        logger.error('Error fetching evolutions:', error)
        return []
    }
}

export async function saveEvolution(patientProfileId: string, data: {
    mood?: string
    publicSummary?: string
    privateNotes?: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Não autenticado' }

        const psychologistProfile = await prisma.psychologistProfile.findUnique({ where: { userId: user.id } })
        if (!psychologistProfile) return { success: false, error: 'Psicólogo não encontrado' }

        const evolution = await prisma.evolution.create({
            data: {
                patientId: patientProfileId,
                psychologistId: psychologistProfile.id,
                mood: data.mood,
                publicSummary: data.publicSummary,
                privateNotes: data.privateNotes,
                date: new Date(),
            }
        })
        return { success: true, data: evolution }
    } catch (error) {
        logger.error('Error saving evolution:', error)
        return { success: false, error: 'Erro ao salvar o registro' }
    }
}

// ─── Session History ─────────────────────────────────────────────────────────

export type SessionHistoryItem = {
    id: string
    scheduledAt: string
    endTime: string
    status: string
    price: string
    psychologistName: string
}

export async function getPatientSessionHistory(patientProfileId: string): Promise<SessionHistoryItem[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const psychologistProfile = await prisma.psychologistProfile.findUnique({ where: { userId: user.id } })
        if (!psychologistProfile) return []

        // Find the user id for this profile
        const profile = await prisma.profile.findUnique({
            where: { id: patientProfileId },
            include: { users: true }
        })
        if (!profile) return []

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: profile.user_id,
                psychologistId: psychologistProfile.id,
            },
            orderBy: { scheduledAt: 'desc' },
            take: 20,
            include: {
                psychologist: {
                    include: { user: true }
                }
            }
        })

        const formatDate = (d: Date) =>
            new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)

        const formatTime = (d: Date) =>
            new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d)

        return appointments.map(appt => {
            const start = new Date(appt.scheduledAt)
            const end = new Date(start.getTime() + appt.durationMinutes * 60 * 1000)
            return {
                id: appt.id,
                scheduledAt: `${formatDate(start)}`,
                endTime: `${formatTime(start)} - ${formatTime(end)}`,
                status: appt.status,
                price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(appt.price)),
                psychologistName: appt.psychologist.user.name || 'Psicólogo',
            }
        })
    } catch (error) {
        logger.error('Error fetching session history:', error)
        return []
    }
}

// ─── Anamnesis ───────────────────────────────────────────────────────────────

export async function updateAnamnesis(patientProfileId: string, data: AnamnesisData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Não autenticado' }
        }

        const psychologistProfile = await prisma.psychologistProfile.findUnique({
            where: { userId: user.id }
        })

        if (!psychologistProfile) {
            return { success: false, error: 'Perfil de psicólogo não encontrado' }
        }

        const existingAnamnesis = await prisma.anamnesis.findFirst({
            where: {
                patientId: patientProfileId,
                psychologistId: psychologistProfile.id
            }
        })

        if (existingAnamnesis) {
            const updated = await prisma.anamnesis.update({
                where: { id: existingAnamnesis.id },
                data: {
                    mainComplaint: data.mainComplaint,
                    familyHistory: data.familyHistory,
                    medication: data.medication,
                    diagnosticHypothesis: data.diagnosticHypothesis,
                }
            })
            return { success: true, data: updated }
        } else {
            const created = await prisma.anamnesis.create({
                data: {
                    patientId: patientProfileId,
                    psychologistId: psychologistProfile.id,
                    mainComplaint: data.mainComplaint,
                    familyHistory: data.familyHistory,
                    medication: data.medication,
                    diagnosticHypothesis: data.diagnosticHypothesis,
                }
            })
            return { success: true, data: created }
        }
    } catch (error) {
        logger.error('Error updating anamnesis:', error)
        return { success: false, error: 'Erro ao salvar a anamnese' }
    }
}
