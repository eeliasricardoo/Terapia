import { PsychologistDashboard } from '@/components/dashboard/psychologist/PsychologistDashboard'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MoodTracker } from '@/components/dashboard/MoodTracker'
import { getCurrentUserProfile } from '@/lib/actions/profile'
import { createClient } from '@/lib/supabase/server'

import { PatientDashboardHeader } from './_components/patient-dashboard-header'
import { FindPsychologistCTA } from './_components/find-psychologist-cta'
import { NextSessionHero } from './_components/next-session-hero'
import { RecentHistory } from './_components/recent-history'
import { PaymentStatusToast } from './_components/payment-status-toast'
import { Suspense } from 'react'
import { QuickActions } from './_components/quick-actions'
import { CompanyDashboard } from '@/components/dashboard/company/CompanyDashboard'
import { UpcomingSessionsList } from './_components/upcoming-sessions-list'

import {
  getAdminDashboardData,
  getCompanyDashboardData,
} from '@/lib/actions/dashboard'
import {
  getCachedPsychologistDashboard,
  getCachedPatientDashboard,
} from '@/lib/cache/dashboard'

export default async function DashboardPage() {
  let userProfile = await getCurrentUserProfile()

  if (!userProfile) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Se autenticado mas sem perfil, redireciona para onboarding ou gera erro controlado
      const metaRole = user.user_metadata?.role as string | undefined
      if (metaRole === 'PSYCHOLOGIST') {
        redirect('/cadastro/profissional/dados')
      } else {
        redirect('/')
      }
    } else {
      redirect('/login/paciente')
    }
  }

  if (userProfile.role === 'PSYCHOLOGIST') {
    const dashboardData = await getCachedPsychologistDashboard(userProfile.user_id)
    return <PsychologistDashboard userProfile={userProfile} dashboardData={dashboardData} />
  }

  if (userProfile.role === 'ADMIN') {
    const adminData = await getAdminDashboardData()
    return <AdminDashboard userProfile={userProfile} dashboardData={adminData} />
  }

  if (userProfile.role === 'COMPANY') {
    const companyData = await getCompanyDashboardData()
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CompanyDashboard userProfile={userProfile} dashboardData={companyData} />
      </div>
    )
  }

  const userName = userProfile?.full_name?.split(' ')[0] || 'Usuário'
  const patientData = await getCachedPatientDashboard(userProfile.user_id)

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto px-4 sm:px-6">
      <Suspense>
        <PaymentStatusToast />
      </Suspense>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Olá, {userName}.</h1>
        <p className="text-slate-600 font-medium">
          Bem-vindo ao seu espaço de cuidado e autoconhecimento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {patientData.nextSession ? (
            <NextSessionHero session={patientData.nextSession} />
          ) : (
            <FindPsychologistCTA />
          )}

          {patientData.upcomingSessions && patientData.upcomingSessions.length > 1 && (
            <UpcomingSessionsList sessions={patientData.upcomingSessions} />
          )}

          <div className="pt-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              Seu Progresso
            </h2>
            <MoodTracker monthlyProgress={patientData.monthlyProgress} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              Ações Rápidas
            </h2>
            <QuickActions />
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              Histórico
            </h2>
            <RecentHistory history={patientData.recentSessions} />
          </div>
        </div>
      </div>
    </div>
  )
}
