'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type FinancialStats = {
  totalRevenue: number
  pendingRevenue: number
  averageTicket: number
  revenueChange: number
  monthlyData: { month: string; value: number }[]
  paymentMethods: { method: string; percentage: number }[]
  isStripeConnected: boolean
  recentTransactions: {
    id: string
    patient: string
    date: string
    amount: number
    status: string
    method: string
  }[]
}

export async function getFinancialStats(): Promise<FinancialStats> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Não autenticado')
    }

    // Find psychologist profile
    const psychologistProfile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psychologistProfile) {
      throw new Error('Perfil de psicólogo não encontrado')
    }

    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Get appointments for current month
    const currentMonthAppts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfile.id,
        scheduledAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        status: 'COMPLETED',
      },
    })

    // Get appointments for last month (for change calculation)
    const lastMonthAppts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfile.id,
        scheduledAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
        status: 'COMPLETED',
      },
    })

    // Get pending appointments
    const pendingAppts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfile.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: currentMonthStart,
        },
      },
    })

    const totalRevenue = currentMonthAppts.reduce((sum, appt) => sum + Number(appt.price), 0)
    const lastMonthRevenue = lastMonthAppts.reduce((sum, appt) => sum + Number(appt.price), 0)
    const pendingRevenue = pendingAppts.reduce((sum, appt) => sum + Number(appt.price), 0)

    const averageTicket = currentMonthAppts.length > 0 ? totalRevenue / currentMonthAppts.length : 0

    const revenueChange =
      lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    // Get data for the last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      const monthAppts = await prisma.appointment.findMany({
        where: {
          psychologistId: psychologistProfile.id,
          scheduledAt: {
            gte: start,
            lte: end,
          },
          status: 'COMPLETED',
        },
      })

      const revenue = monthAppts.reduce((sum, appt) => sum + Number(appt.price), 0)
      monthlyData.push({
        month: format(date, 'MMM', { locale: ptBR }),
        value: revenue,
      })
    }

    // Get recent transactions
    const recentAppts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfile.id,
      },
      include: {
        patient: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: 10,
    })

    const recentTransactions = recentAppts.map((appt) => ({
      id: appt.id,
      patient: appt.patient?.profiles?.fullName || appt.patient?.name || 'Paciente',
      date: format(new Date(appt.scheduledAt), "dd 'de' MMM, yyyy", { locale: ptBR }),
      amount: Number(appt.price),
      status: appt.status.toLowerCase(),
      method: appt.paymentMethod || 'Stripe',
    }))

    // Calculate payment method breakdown from all completed appointments
    const allCompletedAppts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfile.id,
        status: 'COMPLETED',
      },
      select: { paymentMethod: true },
    })

    const methodCounts: Record<string, number> = {}
    allCompletedAppts.forEach((appt) => {
      const method = appt.paymentMethod || 'Stripe'
      methodCounts[method] = (methodCounts[method] || 0) + 1
    })

    const totalCompleted = allCompletedAppts.length
    const paymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      percentage: totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0,
    }))

    return {
      totalRevenue,
      pendingRevenue,
      averageTicket,
      revenueChange,
      monthlyData,
      paymentMethods,
      recentTransactions,
      isStripeConnected: !!psychologistProfile.stripeAccountId,
    }
  } catch (error) {
    logger.error('Error fetching financial stats:', error)
    return {
      totalRevenue: 0,
      pendingRevenue: 0,
      averageTicket: 0,
      revenueChange: 0,
      monthlyData: [],
      paymentMethods: [],
      recentTransactions: [],
      isStripeConnected: false,
    }
  }
}
