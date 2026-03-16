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

import {
  getPsychologistDashboardData,
  getPatientDashboardData,
  getAdminDashboardData,
} from '@/lib/actions/dashboard'

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
    const dashboardData = await getPsychologistDashboardData()
    return <PsychologistDashboard userProfile={userProfile} dashboardData={dashboardData} />
  }

  if (userProfile.role === 'ADMIN') {
    const adminData = await getAdminDashboardData()
    return <AdminDashboard userProfile={userProfile} dashboardData={adminData} />
  }

  if (userProfile.role === 'COMPANY') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CompanyDashboard userProfile={userProfile} />
      </div>
    )
  }

  const userName = userProfile?.full_name?.split(' ')[0] || 'Usuário'
  const patientData = await getPatientDashboardData()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Suspense>
        <PaymentStatusToast />
      </Suspense>
      <PatientDashboardHeader userName={userName} nextSession={patientData.nextSession} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-8">
          <FindPsychologistCTA />
          <NextSessionHero session={patientData.nextSession} />
          <MoodTracker monthlyProgress={patientData.monthlyProgress} />
        </div>

        <div className="col-span-1 space-y-8">
          <QuickActions />
          <RecentHistory history={patientData.recentSessions} />
        </div>
      </div>
    </div>
  )
}
