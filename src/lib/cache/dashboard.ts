/**
 * Dashboard Cache Layer
 *
 * Uses Next.js `unstable_cache` to cache expensive dashboard queries.
 * Cache is invalidated via tags whenever appointments/notifications change.
 *
 * Tags used:
 *  - `dashboard-psych-{userId}` — psychologist dashboard data
 *  - `dashboard-patient-{userId}` — patient dashboard data
 *  - `appointments` — invalidated on any appointment change (revalidateTag from sessions.ts)
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import type { PsychologistDashboardData, PatientDashboardData } from '../actions/dashboard'

const CACHE_TTL_SECONDS = 60 // 1 minute — short enough to feel live, long enough to reduce DB hits

// ─── Psychologist Dashboard ───────────────────────────────────────────────────

export function getCachedPsychologistDashboard(userId: string) {
  return unstable_cache(() => fetchPsychologistDashboard(userId), [`dashboard-psych-${userId}`], {
    revalidate: CACHE_TTL_SECONDS,
    tags: [`dashboard-psych-${userId}`, 'appointments'],
  })()
}

async function fetchPsychologistDashboard(userId: string): Promise<PsychologistDashboardData> {
  const psychProfile = await prisma.psychologistProfile.findUnique({
    where: { userId },
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
  const pastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStart = startOfMonth(pastMonthDate)
  const lastMonthEnd = endOfMonth(pastMonthDate)

  // Run all independent queries in parallel via $transaction
  const [
    upcomingSessions,
    futureSessionsData,
    activeLinksCount,
    totalLinksCount,
    monthlySessions,
    lastMonthlySessions,
    recentAppts,
    psychUserProfile,
    unreadNotifications,
  ] = await prisma.$transaction([
    // 1. Today's sessions
    prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: { patient: { include: { profiles: true } } },
      orderBy: { scheduledAt: 'asc' },
    }),
    // 2. Future sessions (next 60)
    prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gt: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: { patient: { include: { profiles: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 60,
    }),
    // 3. Active patient links count
    prisma.patientPsychologistLink.count({
      where: { psychologistId: userId, status: 'active' },
    }),
    // 4. Total patient links count
    prisma.patientPsychologistLink.count({
      where: { psychologistId: userId },
    }),
    // 5. This month completed appointments (for revenue)
    prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: monthStart, lte: monthEnd },
        status: 'COMPLETED',
      },
      select: { price: true },
    }),
    // 6. Last month completed appointments (for revenue change %)
    prisma.appointment.findMany({
      where: {
        psychologistId: psychProfile.id,
        scheduledAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'COMPLETED',
      },
      select: { price: true },
    }),
    // 7. Recent appointments for patient list (limit 10, ordered desc)
    prisma.appointment.findMany({
      where: { psychologistId: psychProfile.id },
      include: { patient: { include: { profiles: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    }),
    // 8. Psychologist's own profile
    prisma.profile.findUnique({
      where: { user_id: userId },
      select: { id: true },
    }),
    // 9. Unread notifications count
    prisma.notification.count({
      where: { userId, read: false },
    }),
  ])

  // Calculate revenue
  const monthlyRevenue = monthlySessions.reduce((acc, s) => acc + Number(s.price), 0)
  const lastMonthRevenue = lastMonthlySessions.reduce((acc, s) => acc + Number(s.price), 0)

  let revenueChange = 0
  if (lastMonthRevenue > 0) {
    revenueChange = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  } else if (monthlyRevenue > 0) {
    revenueChange = 100
  }

  // Build patient link status map (only if profile found)
  let statusByUserId = new Map<string, string>()
  if (psychUserProfile) {
    const uniquePatientUserIds = [...new Set(recentAppts.map((a) => a.patientId))]
    const profileIds = await prisma.profile
      .findMany({
        where: { user_id: { in: uniquePatientUserIds } },
        select: { id: true, user_id: true },
      })
      .then((profiles) => profiles)

    const profileIdList = profileIds.map((p) => p.id)
    const patientLinks = await prisma.patientPsychologistLink.findMany({
      where: {
        psychologistId: psychUserProfile.id,
        patientId: { in: profileIdList },
      },
      include: { patient: { select: { user_id: true } } },
    })

    patientLinks.forEach((link) => {
      statusByUserId.set(link.patient.user_id, link.status)
    })
  }

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

  // Build unique recent patients list
  const uniquePatientsMap = new Map<
    string,
    { id: string; name: string; lastSession: Date; status: string }
  >()
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

  return {
    stats: {
      sessionsToday: upcomingSessions.length,
      activePatients: activeLinksCount,
      totalPatients: totalLinksCount,
      monthlyRevenue,
      revenueChange: Math.round(revenueChange),
    },
    unreadNotifications,
    isVerified: psychProfile.isVerified,
    hasStripeAccount: !!psychProfile.stripeAccountId,
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
}

// ─── Patient Dashboard ────────────────────────────────────────────────────────

export function getCachedPatientDashboard(userId: string) {
  return unstable_cache(() => fetchPatientDashboard(userId), [`dashboard-patient-${userId}`], {
    revalidate: CACHE_TTL_SECONDS,
    tags: [`dashboard-patient-${userId}`, 'appointments'],
  })()
}

async function fetchPatientDashboard(userId: string): Promise<PatientDashboardData> {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const [nextSessionAppt, recentAppts, monthlyAppointments, upcomingAppts] =
      await prisma.$transaction([
        // 1. Next upcoming session
        prisma.appointment.findFirst({
          where: {
            patientId: userId,
            scheduledAt: { gte: now },
            status: 'SCHEDULED',
          },
          orderBy: { scheduledAt: 'asc' },
          include: {
            psychologist: { include: { user: { include: { profiles: true } } } },
          },
        }),
        // 2. Recent past sessions
        prisma.appointment.findMany({
          where: {
            patientId: userId,
            scheduledAt: { lte: now },
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
          include: {
            psychologist: { include: { user: { include: { profiles: true } } } },
          },
        }),
        // 3. Monthly progress
        prisma.appointment.findMany({
          where: {
            patientId: userId,
            scheduledAt: { gte: monthStart, lte: monthEnd },
            status: { in: ['COMPLETED', 'SCHEDULED'] },
          },
          select: { status: true },
        }),
        // 4. All upcoming sessions
        prisma.appointment.findMany({
          where: {
            patientId: userId,
            scheduledAt: { gte: now },
            status: 'SCHEDULED',
          },
          orderBy: { scheduledAt: 'asc' },
          include: {
            psychologist: { include: { user: { include: { profiles: true } } } },
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

    const completedSessions = monthlyAppointments.filter((a) => a.status === 'COMPLETED').length
    const totalSessions = monthlyAppointments.length

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
      monthlyProgress: { completedSessions, totalSessions },
      upcomingSessions,
    }
  } catch (error) {
    logger.error('Error fetching patient dashboard (cached):', error)
    return {
      nextSession: null,
      recentSessions: [],
      monthlyProgress: { completedSessions: 0, totalSessions: 0 },
      upcomingSessions: [],
    }
  }
}
