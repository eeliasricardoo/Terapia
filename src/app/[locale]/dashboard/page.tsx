import { PsychologistDashboard } from '@/components/dashboard/psychologist/PsychologistDashboard'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/actions/profile'
import { createClient } from '@/lib/supabase/server'
import { CompanyDashboard } from '@/components/dashboard/company/CompanyDashboard'
import { getAdminDashboardData, getCompanyDashboardData } from '@/lib/actions/dashboard'
import { getCachedPsychologistDashboard, getCachedPatientDashboard } from '@/lib/cache/dashboard'
import { PatientDashboardClient } from './_components/PatientDashboardClient'

export default async function DashboardPage() {
  const userProfile = await getCurrentUserProfile()

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
    const adminRes = await getAdminDashboardData()
    const adminData = adminRes.success ? adminRes.data : null

    if (!adminData) {
      return (
        <div className="p-8 text-center bg-white rounded-3xl">
          Erro ao carregar dados do administrador
        </div>
      )
    }

    return <AdminDashboard userProfile={userProfile} dashboardData={adminData} />
  }

  if (userProfile.role === 'COMPANY') {
    const companyRes = await getCompanyDashboardData()
    const companyData = companyRes.success ? companyRes.data : null

    if (!companyData) {
      return (
        <div className="p-8 text-center bg-white rounded-3xl">
          Erro ao carregar dados da empresa
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CompanyDashboard userProfile={userProfile} dashboardData={companyData} />
      </div>
    )
  }

  const userName = (userProfile?.full_name || '').split(' ')[0] || 'Usuário'
  const patientData = await getCachedPatientDashboard(userProfile.user_id)

  return <PatientDashboardClient userName={userName} patientData={patientData} />
}
