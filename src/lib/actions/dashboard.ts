'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export type PsychologistDashboardData = {
    stats: {
        sessionsToday: number
        activePatients: number
        totalPatients: number
        monthlyRevenue: number
        revenueChange: number // % vs last month
    }
    upcomingSessions: {
        id: string
        patientName: string
        time: string
        type: string
        status: string
        image?: string
        duration: number
        details?: string
    }[]
    recentPatients: {
        id: string
        name: string
        lastSession: string
        status: string
    }[]
}

export type PatientDashboardData = {
    nextSession: {
        id: string
        type: string
        scheduledAt: string
        durationMinutes: number
        psychologist: {
            name: string
            specialty: string
            image?: string
        }
    } | null
    recentSessions: {
        id: string
        psychologistName: string
        date: string
        status: string
    }[]
}

export async function getPsychologistDashboardData(): Promise<PsychologistDashboardData> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Não autenticado')

        const psychProfile = await prisma.psychologistProfile.findUnique({
            where: { userId: user.id }
        })

        if (!psychProfile) throw new Error('Perfil profissional não encontrado')

        const now = new Date()
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        // 1. Sessions Today
        const sessionsToday = await prisma.appointment.findMany({
            where: {
                psychologistId: psychProfile.id,
                scheduledAt: { gte: todayStart, lte: todayEnd },
                status: { not: 'CANCELED' }
            },
            include: {
                patient: { include: { profiles: true } }
            },
            orderBy: { scheduledAt: 'asc' }
        })

        // 2. Active Patients Count (from links table)
        const activeLinks = await prisma.patientPsychologistLink.findMany({
            where: {
                psychologistId: psychProfile.id,
                status: 'active'
            }
        })
        const totalLinks = await prisma.patientPsychologistLink.count({
            where: { psychologistId: psychProfile.id }
        })

        // 3. Monthly Revenue (Completed only)
        const monthlySessions = await prisma.appointment.findMany({
            where: {
                psychologistId: psychProfile.id,
                scheduledAt: { gte: monthStart, lte: monthEnd },
                status: 'COMPLETED'
            }
        })
        const monthlyRevenue = monthlySessions.reduce((acc, s) => acc + Number(s.price), 0)

        // 4. Recent Patients (based on latest appointments)
        const recentAppts = await prisma.appointment.findMany({
            where: { psychologistId: psychProfile.id },
            include: {
                patient: { include: { profiles: true } }
            },
            orderBy: { scheduledAt: 'desc' },
            take: 10
        })

        // Unique patients from recent appointments
        const uniquePatientsMap = new Map()
        recentAppts.forEach(appt => {
            if (!uniquePatientsMap.has(appt.patientId) && uniquePatientsMap.size < 5) {
                uniquePatientsMap.set(appt.patientId, {
                    id: appt.patientId,
                    name: appt.patient.profiles?.fullName || appt.patient.name || 'Paciente',
                    lastSession: appt.scheduledAt,
                    status: 'active' // Simplified
                })
            }
        })

        const formatTime = (date: Date) => {
            return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
        }

        const getTimeAgo = (date: Date) => {
            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
            if (diffInDays === 0) return 'Hoje'
            if (diffInDays === 1) return 'Ontem'
            return `Há ${diffInDays} dias`
        }

        return {
            stats: {
                sessionsToday: sessionsToday.length,
                activePatients: activeLinks.length,
                totalPatients: totalLinks,
                monthlyRevenue,
                revenueChange: 0
            },
            upcomingSessions: sessionsToday.map(s => ({
                id: s.id,
                patientName: s.patient.profiles?.fullName || s.patient.name || 'Paciente',
                time: formatTime(s.scheduledAt),
                type: 'Terapia Individual',
                status: s.status.toLowerCase(),
                image: s.patient.profiles?.avatarUrl || undefined,
                duration: s.durationMinutes,
                details: s.status === 'SCHEDULED' ? 'Aguardando início' : 'Concluída'
            })),
            recentPatients: Array.from(uniquePatientsMap.values()).map(p => ({
                ...p,
                lastSession: getTimeAgo(p.lastSession)
            }))
        }
    } catch (error) {
        logger.error('Error fetching psychologist dashboard data:', error)
        throw error
    }
}

export async function getPatientDashboardData(): Promise<PatientDashboardData> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Não autenticado')

        // 1. Next Session
        const now = new Date().toISOString()
        const { data: nextSessionData } = await supabase
            .from('appointments')
            .select(`
                *,
                psychologist:profiles!appointments_psychologist_id_fkey(*)
            `)
            .eq('patient_id', user.id)
            .gte('scheduled_at', now)
            .eq('status', 'scheduled')
            .order('scheduled_at', { ascending: true })
            .limit(1)
            .single()

        let nextSession = null
        if (nextSessionData) {
            nextSession = {
                id: nextSessionData.id,
                type: 'Terapia Individual',
                scheduledAt: nextSessionData.scheduled_at,
                durationMinutes: nextSessionData.duration_minutes,
                psychologist: {
                    name: (nextSessionData.psychologist as any).full_name || 'Psicólogo',
                    specialty: 'Psicólogo Clínico',
                    image: (nextSessionData.psychologist as any).avatar_url
                }
            }
        }

        // 2. Recent Sessions
        const { data: recentData } = await supabase
            .from('appointments')
            .select(`
                *,
                psychologist:profiles!appointments_psychologist_id_fkey(*)
            `)
            .eq('patient_id', user.id)
            .lte('scheduled_at', now)
            .order('scheduled_at', { ascending: false })
            .limit(5)

        const recentSessions = (recentData || []).map(s => ({
            id: s.id,
            psychologistName: (s.psychologist as any).full_name || 'Psicólogo',
            date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(s.scheduled_at)),
            status: s.status.toLowerCase()
        }))

        return {
            nextSession,
            recentSessions
        }
    } catch (error) {
        logger.error('Error fetching patient dashboard data:', error)
        return { nextSession: null, recentSessions: [] }
    }
}
