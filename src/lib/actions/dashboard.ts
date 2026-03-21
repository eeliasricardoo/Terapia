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
  unreadNotifications: number
  isVerified: boolean
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

export async function getPsychologistDashboardData(): Promise<PsychologistDashboardData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const psychProfile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psychProfile) {
      // Se o perfil do psicólogo não existir (ex: após reset de DB mas mantendo sessão),
      // retornamos um estado vazio em vez de estourar erro
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
        timezone: 'America/Sao_Paulo',
        upcomingSessions: [],
        recentPatients: [],
      }
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // 1. Today's Sessions only — used for "Agenda de Hoje" initial render and sessionsToday stat
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

    // 2. Active Patients Count (from links table)
    // Links relate Profile (user.id) to Profile (user.id)
    const activeLinks = await prisma.patientPsychologistLink.findMany({
      where: {
        psychologistId: user.id,
        status: 'active',
      },
    })
    const totalLinks = await prisma.patientPsychologistLink.count({
      where: { psychologistId: user.id },
    })

    // 3. Monthly Revenue (Completed only)
    const monthlySessions = await prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: monthStart, lte: monthEnd },
        status: 'COMPLETED',
      },
    })
    const monthlyRevenue = monthlySessions.reduce((acc, s) => acc + Number(s.price), 0)

    // Calculate Last Month Revenue for Change %
    const pastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = startOfMonth(pastMonthDate)
    const lastMonthEnd = endOfMonth(pastMonthDate)

    const lastMonthlySessions = await prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'COMPLETED',
      },
    })
    const lastMonthRevenue = lastMonthlySessions.reduce((acc, s) => acc + Number(s.price), 0)

    let revenueChange = 0
    if (lastMonthRevenue > 0) {
      revenueChange = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    } else if (monthlyRevenue > 0) {
      revenueChange = 100
    }

    // 4. Recent Patients (based on latest appointments)
    const recentAppts = await prisma.appointment.findMany({
      where: { psychologistId: psychProfile.id },
      include: {
        patient: { include: { profiles: true } },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    })

    // Get psychologist's Profile (for PatientPsychologistLink lookup)
    const psychUserProfile = await prisma.profile.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    })

    // Get unique patient IDs
    const uniquePatientIds = [...new Set(recentAppts.map((a) => a.patientId))]

    // Fetch link statuses for these patients
    const patientLinks = psychUserProfile
      ? await prisma.patientPsychologistLink.findMany({
          where: {
            psychologistId: psychUserProfile.id,
            patientId: {
              in: await prisma.profile
                .findMany({
                  where: { user_id: { in: uniquePatientIds } },
                  select: { id: true },
                })
                .then((profiles) => profiles.map((p) => p.id)),
            },
          },
          include: { patient: true },
        })
      : []

    // Build a map: userId -> link status
    const statusByUserId = new Map<string, string>()
    patientLinks.forEach((link) => {
      statusByUserId.set(link.patient.user_id, link.status)
    })

    // Unique patients from recent appointments
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

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
    }

    const getTimeAgo = (date: Date) => {
      const diffInTime = now.getTime() - date.getTime()
      const diffInDays = Math.floor(Math.abs(diffInTime) / (1000 * 60 * 60 * 24))

      if (diffInTime < 0) {
        // Futuro
        if (diffInDays === 0) return 'Hoje'
        if (diffInDays === 1) return 'Amanhã'
        return `Em ${diffInDays} dias`
      } else {
        // Passado
        if (diffInDays === 0) return 'Hoje'
        if (diffInDays === 1) return 'Ontem'
        return `Há ${diffInDays} dias`
      }
    }

    // 5. Unread Notifications Count (Using raw SQL as fallback for runtime model sync)
    // @ts-ignore
    const unreadCount: any = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM notifications 
      WHERE user_id = ${user.id} AND read = false
    `.catch(() => [{ count: 0 }])

    const unreadNotifications = unreadCount[0]?.count || 0

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
      recentPatients: Array.from(uniquePatientsMap.values()).map((p) => ({
        ...p,
        lastSession: getTimeAgo(p.lastSession),
      })),
    }
  } catch (error) {
    logger.error('Error fetching psychologist dashboard data:', error)
    throw error
  }
}

export async function getPatientDashboardData(): Promise<PatientDashboardData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // 1. Next Session
    const nextSessionAppt = await prisma.appointment.findFirst({
      where: {
        patientId: user.id,
        scheduledAt: { gte: new Date() },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
    })

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

    // 2. Recent Sessions
    const recentAppts = await prisma.appointment.findMany({
      where: {
        patientId: user.id,
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 5,
      include: {
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
    })

    const recentSessions = recentAppts.map((s) => ({
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
    }))

    // 3. Monthly Progress
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        patientId: user.id,
        scheduledAt: { gte: monthStart, lte: monthEnd },
        status: { in: ['COMPLETED', 'SCHEDULED'] },
      },
    })

    const completedSessions = monthlyAppointments.filter((a) => a.status === 'COMPLETED').length
    const totalSessions = monthlyAppointments.length

    // 4. All Upcoming Sessions
    const upcomingAppts = await prisma.appointment.findMany({
      where: {
        patientId: user.id,
        scheduledAt: { gte: new Date() },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
    })

    const upcomingSessions = upcomingAppts.map((appt) => {
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
    })

    return {
      nextSession,
      recentSessions,
      monthlyProgress: {
        completedSessions,
        totalSessions,
      },
      upcomingSessions,
    }
  } catch (error) {
    logger.error('Error fetching patient dashboard data:', error)
    return {
      nextSession: null,
      recentSessions: [],
      monthlyProgress: { completedSessions: 0, totalSessions: 0 },
      upcomingSessions: [],
    }
  }
}

export type AdminDashboardData = {
  totalUsers: number
  verifiedPsychologists: number
  activeSessions: number
  totalAppointments: number
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const totalUsers = await prisma.user.count()
    const verifiedPsychologists = await prisma.psychologistProfile.count({
      where: { isVerified: true },
    })

    const now = new Date()
    const monthStart = startOfMonth(now)
    const activeSessions = await prisma.appointment.count({
      where: {
        scheduledAt: { gte: monthStart },
        status: { not: 'CANCELED' },
      },
    })

    const totalAppointments = await prisma.appointment.count()

    return {
      totalUsers,
      verifiedPsychologists,
      activeSessions,
      totalAppointments,
    }
  } catch (error) {
    logger.error('Error fetching admin dashboard data:', error)
    return {
      totalUsers: 0,
      verifiedPsychologists: 0,
      activeSessions: 0,
      totalAppointments: 0,
    }
  }
}

export async function getCompanyDashboardData(): Promise<CompanyDashboardData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
      include: {
        members: {
          include: {
            profile: {
              include: {
                users: {
                  include: {
                    patientAppointments: true,
                  },
                },
              },
            },
          },
        },
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

    const totalEmployees = company.members.length
    const now = new Date()
    const monthStart = startOfMonth(now)

    const allMembersAppts = company.members.flatMap((m) =>
      m.profile.users.patientAppointments.filter((a) => a.scheduledAt >= monthStart)
    )

    const activeSessions = allMembersAppts.length
    const monthlyInvestment = activeSessions * 199

    const recentActivity = allMembersAppts
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
      .slice(0, 5)
      .map((a) => ({
        user:
          company.members.find((m) => m.profile.user_id === a.patientId)?.profile.fullName ||
          'Colaborador',
        department: 'Time',
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
          a.scheduledAt
        ),
        type: a.sessionType,
        status: a.status === 'COMPLETED' ? 'Concluído' : 'Agendado',
      }))

    return {
      stats: {
        totalEmployees,
        activeSessions,
        monthlyInvestment,
        wellbeingIndex: 8.2,
        employeesChange: '+0 este mês',
        sessionsChange: '100% de utilização',
        investmentChange: 'Dentro do orçamento',
        wellbeingChange: '+0.0',
      },
      recentActivity,
    }
  } catch (error) {
    logger.error('Error fetching company dashboard data:', error)
    throw error
  }
}
