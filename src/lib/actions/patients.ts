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
