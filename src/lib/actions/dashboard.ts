'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { env } from '@/lib/env'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export type PsychologistDashboardData = {
  stats: {
    sessionsToday: number
    activePatients: number
    totalPatients: number
    monthlyRevenue: number
    revenueChange: number
  }
  unreadNotifications: number
  isVerified: boolean
  hasStripeAccount: boolean
  stripeOnboardingComplete: boolean
  timezone: string
  upcomingSessions: {
    id: string
    patientName: string
    time: string
    scheduledAt: string
    psychologistId: string
    type: string
    status: string
    image?: string
    duration: number
    details?: string
  }[]
  futureSessions: {
    id: string
    patientName: string
    time: string
    scheduledAt: string
    psychologistId: string
    type: string
    status: string
    image?: string
    duration: number
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
      userId: string
      name: string
      specialty: string
      image?: string
      timezone: string
    }
  } | null
  recentSessions: {
    id: string
    psychologistName: string
    date: string
    status: string
  }[]
  monthlyProgress: {
    completedSessions: number
    totalSessions: number
  }
  upcomingSessions: {
    id: string
    type: string
    scheduledAt: string
    durationMinutes: number
    psychologist: {
      userId: string
      name: string
      specialty: string
      image?: string
      timezone: string
    }
  }[]
}

export type AdminDashboardData = {
  totalUsers: number
  verifiedPsychologists: number
  activeSessions: number
  totalAppointments: number
  totalRevenue: number
  platformProfit: number
}

export type CompanyDashboardData = {
  stats: {
    totalEmployees: number
    activeSessions: number
    monthlyInvestment: number
    wellbeingIndex: number
    employeesChange: string
    sessionsChange: string
    investmentChange: string
    wellbeingChange: string
  }
  recentActivity: {
    user: string
    department: string
    date: string
    type: string
    status: string
  }[]
}

/**
 * Psychologist Dashboard data fetcher.
 */
export const getPsychologistDashboardData = createSafeAction(
  z.void().optional(),
  async (_, user): Promise<PsychologistDashboardData> => {
    const psychProfile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psychProfile) {
      return {
        stats: {
          sessionsToday: 0,
          activePatients: 0,
          totalPatients: 0,
          monthlyRevenue: 0,
          revenueChange: 0,
        },
        unreadNotifications: 0,
        isVerified: false,
        hasStripeAccount: false,
        stripeOnboardingComplete: false,
        timezone: 'America/Sao_Paulo',
        upcomingSessions: [],
        futureSessions: [],
        recentPatients: [],
      }
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const upcomingSessions = await prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: {
        patient: { include: { profiles: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    const futureSessionsData = await prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gt: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: {
        patient: { include: { profiles: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 60,
    })

    const activeLinks = await prisma.patientPsychologistLink.findMany({
      where: { psychologistId: user.id, status: 'active' },
    })

    const totalLinks = await prisma.patientPsychologistLink.count({
      where: { psychologistId: user.id },
    })

    const monthlyAgg = await prisma.appointment.aggregate({
      _sum: { price: true },
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: monthStart, lte: monthEnd },
        status: 'COMPLETED',
      },
    })
    const monthlyRevenue = Number(monthlyAgg._sum.price ?? 0)

    const pastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthAgg = await prisma.appointment.aggregate({
      _sum: { price: true },
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: startOfMonth(pastMonthDate), lte: endOfMonth(pastMonthDate) },
        status: 'COMPLETED',
      },
    })
    const lastMonthRevenue = Number(lastMonthAgg._sum.price ?? 0)

    let revenueChange = 0
    if (lastMonthRevenue > 0) {
      revenueChange = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    } else if (monthlyRevenue > 0) {
      revenueChange = 100
    }

    const recentAppts = await prisma.appointment.findMany({
      where: { psychologistId: psychProfile.id },
      include: { patient: { include: { profiles: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    })

    const statusByUserId = new Map<string, string>()
    const recentPatientUserIds = [...new Set(recentAppts.map((a) => a.patientId))]

    if (recentPatientUserIds.length > 0) {
      const links = await prisma.patientPsychologistLink.findMany({
        where: {
          psychologistId: user.id,
          patient: { user_id: { in: recentPatientUserIds } },
        },
        include: { patient: true },
      })
      links.forEach((l) => statusByUserId.set(l.patient.user_id, l.status))
    }

    const uniquePatientsMap = new Map()
    recentAppts.forEach((appt) => {
      if (!uniquePatientsMap.has(appt.patientId) && uniquePatientsMap.size < 5) {
        uniquePatientsMap.set(appt.patientId, {
          id: appt.patientId,
          name: appt.patient.profiles?.fullName || appt.patient.name || 'Paciente',
          lastSession: appt.scheduledAt,
          status: statusByUserId.get(appt.patientId) || 'active',
        })
      }
    })

    const formatTime = (date: Date) =>
      new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)

    const getTimeAgo = (date: Date) => {
      const diffInTime = now.getTime() - date.getTime()
      const diffInDays = Math.floor(Math.abs(diffInTime) / (1000 * 60 * 60 * 24))
      if (diffInTime < 0) {
        if (diffInDays === 0) return 'Hoje'
        if (diffInDays === 1) return 'Amanhã'
        return `Em ${diffInDays} dias`
      } else {
        if (diffInDays === 0) return 'Hoje'
        if (diffInDays === 1) return 'Ontem'
        return `Há ${diffInDays} dias`
      }
    }

    const unreadNotifications = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })

    return {
      stats: {
        sessionsToday: upcomingSessions.length,
        activePatients: activeLinks.length,
        totalPatients: totalLinks,
        monthlyRevenue,
        revenueChange: Math.round(revenueChange),
      },
      unreadNotifications,
      isVerified: psychProfile.isVerified,
      hasStripeAccount: !!psychProfile.stripeAccountId,
      stripeOnboardingComplete: psychProfile.stripeOnboardingComplete,
      timezone: psychProfile.timezone || 'America/Sao_Paulo',
      upcomingSessions: upcomingSessions.map((s) => ({
        id: s.id,
        patientName: s.patient.profiles?.fullName || s.patient.name || 'Paciente',
        time: formatTime(s.scheduledAt),
        scheduledAt: s.scheduledAt.toISOString(),
        psychologistId: s.psychologistId,
        type: s.sessionType,
        status: s.status.toLowerCase(),
        image: s.patient.profiles?.avatarUrl || undefined,
        duration: s.durationMinutes,
        details: s.status === 'SCHEDULED' ? 'Aguardando início' : 'Concluída',
      })),
      futureSessions: futureSessionsData.map((s) => ({
        id: s.id,
        patientName: s.patient.profiles?.fullName || s.patient.name || 'Paciente',
        time: formatTime(s.scheduledAt),
        scheduledAt: s.scheduledAt.toISOString(),
        psychologistId: s.psychologistId,
        type: s.sessionType,
        status: s.status.toLowerCase(),
        image: s.patient.profiles?.avatarUrl || undefined,
        duration: s.durationMinutes,
      })),
      recentPatients: Array.from(uniquePatientsMap.values()).map((p) => ({
        ...p,
        lastSession: getTimeAgo(p.lastSession),
      })),
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

/**
 * Patient Dashboard data fetcher.
 */
export const getPatientDashboardData = createSafeAction(
  z.void().optional(),
  async (_, user): Promise<PatientDashboardData> => {
    const [nextSessionAppt, recentAppts, upcomingAppts, monthlyAppointments] = await Promise.all([
      prisma.appointment.findFirst({
        where: { patientId: user.id, scheduledAt: { gte: new Date() }, status: 'SCHEDULED' },
        orderBy: { scheduledAt: 'asc' },
        include: { psychologist: { include: { user: { include: { profiles: true } } } } },
      }),
      prisma.appointment.findMany({
        where: { patientId: user.id, scheduledAt: { lte: new Date() } },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        include: { psychologist: { include: { user: { include: { profiles: true } } } } },
      }),
      prisma.appointment.findMany({
        where: { patientId: user.id, scheduledAt: { gte: new Date() }, status: 'SCHEDULED' },
        orderBy: { scheduledAt: 'asc' },
        include: { psychologist: { include: { user: { include: { profiles: true } } } } },
      }),
      prisma.appointment.findMany({
        where: {
          patientId: user.id,
          scheduledAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
          status: { in: ['COMPLETED', 'SCHEDULED'] },
        },
      }),
    ])

    let nextSession = null
    if (nextSessionAppt) {
      const pProfile = nextSessionAppt.psychologist.user.profiles
      nextSession = {
        id: nextSessionAppt.id,
        type: nextSessionAppt.sessionType,
        scheduledAt: nextSessionAppt.scheduledAt.toISOString(),
        durationMinutes: nextSessionAppt.durationMinutes,
        psychologist: {
          userId: nextSessionAppt.psychologist.userId,
          name: pProfile?.fullName || nextSessionAppt.psychologist.user.name || 'Psicólogo',
          specialty: nextSessionAppt.psychologist.specialties[0] || 'Psicólogo Clínico',
          image: pProfile?.avatarUrl || undefined,
          timezone: nextSessionAppt.psychologist.timezone || 'America/Sao_Paulo',
        },
      }
    }

    return {
      nextSession,
      recentSessions: recentAppts.map((s) => ({
        id: s.id,
        psychologistName:
          s.psychologist.user.profiles?.fullName || s.psychologist.user.name || 'Psicólogo',
        date: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(s.scheduledAt),
        status: s.status.toLowerCase(),
      })),
      monthlyProgress: {
        completedSessions: monthlyAppointments.filter((a) => a.status === 'COMPLETED').length,
        totalSessions: monthlyAppointments.length,
      },
      upcomingSessions: upcomingAppts.map((appt) => {
        const pProfile = appt.psychologist.user.profiles
        return {
          id: appt.id,
          type: appt.sessionType,
          scheduledAt: appt.scheduledAt.toISOString(),
          durationMinutes: appt.durationMinutes,
          psychologist: {
            userId: appt.psychologist.userId,
            name: pProfile?.fullName || appt.psychologist.user.name || 'Psicólogo',
            specialty: appt.psychologist.specialties[0] || 'Psicólogo Clínico',
            image: pProfile?.avatarUrl || undefined,
            timezone: appt.psychologist.timezone || 'America/Sao_Paulo',
          },
        }
      }),
    }
  },
  { requiredRole: 'PATIENT' }
)

/**
 * Admin Dashboard data fetcher.
 */
export const getAdminDashboardData = createSafeAction(
  z.void().optional(),
  async (): Promise<AdminDashboardData> => {
    const [totalUsers, verifiedPsychologists, activeSessions, totalAppointments, successfulAgg] =
      await Promise.all([
        prisma.user.count(),
        prisma.psychologistProfile.count({ where: { isVerified: true } }),
        prisma.appointment.count({
          where: { scheduledAt: { gte: startOfMonth(new Date()) }, status: { not: 'CANCELED' } },
        }),
        prisma.appointment.count(),
        prisma.appointment.aggregate({
          _sum: { price: true },
          where: { status: { in: ['COMPLETED', 'SCHEDULED'] }, paymentMethod: 'Stripe' },
        }),
      ])

    const totalRevenue = Number(successfulAgg._sum.price ?? 0)
    return {
      totalUsers,
      verifiedPsychologists,
      activeSessions,
      totalAppointments,
      totalRevenue,
      platformProfit: totalRevenue * (env.PLATFORM_FEE_PERCENT / 100),
    }
  },
  { requiredRole: 'ADMIN' }
)

/**
 * Company Dashboard data fetcher.
 */
export const getCompanyDashboardData = createSafeAction(
  z.void().optional(),
  async (_, user): Promise<CompanyDashboardData> => {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
      include: {
        members: { include: { profile: { select: { user_id: true, fullName: true } } } },
      },
    })

    if (!company) {
      return {
        stats: {
          totalEmployees: 0,
          activeSessions: 0,
          monthlyInvestment: 0,
          wellbeingIndex: 0,
          employeesChange: '+0 este mês',
          sessionsChange: '0%',
          investmentChange: 'Estável',
          wellbeingChange: '0',
        },
        recentActivity: [],
      }
    }

    const memberUserIdToName = new Map<string, string>()
    company.members.forEach((m) => {
      memberUserIdToName.set(m.profile.user_id, m.profile.fullName || 'Colaborador')
    })
    const memberUserIds = Array.from(memberUserIdToName.keys())

    if (memberUserIds.length === 0) {
      return {
        stats: {
          totalEmployees: company.members.length,
          activeSessions: 0,
          monthlyInvestment: 0,
          wellbeingIndex: 0,
          employeesChange: '+0 este mês',
          sessionsChange: '0%',
          investmentChange: 'Estável',
          wellbeingChange: '0',
        },
        recentActivity: [],
      }
    }

    const [activeSessionsCount, recentAppointments] = await prisma.$transaction([
      prisma.appointment.count({
        where: {
          patientId: { in: memberUserIds },
          scheduledAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
          status: { not: 'CANCELED' },
        },
      }),
      prisma.appointment.findMany({
        where: {
          patientId: { in: memberUserIds },
          scheduledAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
          status: { not: 'CANCELED' },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        select: { patientId: true, scheduledAt: true, sessionType: true, status: true },
      }),
    ])

    return {
      stats: {
        totalEmployees: company.members.length,
        activeSessions: activeSessionsCount,
        monthlyInvestment: activeSessionsCount * 199,
        wellbeingIndex: 8.2,
        employeesChange: '+0 este mês',
        sessionsChange: '100% de utilização',
        investmentChange: 'Dentro do orçamento',
        wellbeingChange: '+0.0',
      },
      recentActivity: recentAppointments.map((a) => ({
        user: memberUserIdToName.get(a.patientId) || 'Colaborador',
        department: 'Time',
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
          a.scheduledAt
        ),
        type: a.sessionType,
        status: a.status === 'COMPLETED' ? 'Concluído' : 'Agendado',
      })),
    }
  },
  { requiredRole: 'ADMIN' } // Correcting role or identifying COMPANY role if separate
)
