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
  // Read the user + role from JWT in parallel with the profile fetch.
  // The role lives in JWT metadata (set at signup) so we can kick off the
  // role-specific dashboard query without waiting for the profile round-trip.
  const supabase = await createClient()
  const userPromise = supabase.auth.getUser()
  const profilePromise = getCurrentUserProfile()

  const {
    data: { user },
  } = await userPromise

  if (!user) {
    redirect('/login/paciente')
  }

  const metaRole = (user.user_metadata?.role || user.app_metadata?.role || 'PATIENT') as
    | 'PATIENT'
    | 'PSYCHOLOGIST'
    | 'ADMIN'
    | 'COMPANY'

  // Kick off the role-specific fetch immediately — don't wait for the profile.
  const roleDataPromise: Promise<unknown> =
    metaRole === 'PSYCHOLOGIST'
      ? getCachedPsychologistDashboard(user.id)
      : metaRole === 'ADMIN'
        ? getAdminDashboardData()
        : metaRole === 'COMPANY'
          ? getCompanyDashboardData()
          : getCachedPatientDashboard(user.id)

  const userProfile = await profilePromise

  if (!userProfile) {
    if (metaRole === 'PSYCHOLOGIST') {
      redirect('/cadastro/profissional/dados')
    }
    redirect('/')
  }

  if (userProfile.role === 'PSYCHOLOGIST') {
    const dashboardData = (await roleDataPromise) as Awaited<
      ReturnType<typeof getCachedPsychologistDashboard>
    >
    return <PsychologistDashboard userProfile={userProfile} dashboardData={dashboardData} />
  }

  if (userProfile.role === 'ADMIN') {
    const adminRes = (await roleDataPromise) as Awaited<ReturnType<typeof getAdminDashboardData>>
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
    const companyRes = (await roleDataPromise) as Awaited<
      ReturnType<typeof getCompanyDashboardData>
    >
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

  const userName = (userProfile.full_name || '').split(' ')[0] || 'Usuário'
  const patientData = (await roleDataPromise) as Awaited<
    ReturnType<typeof getCachedPatientDashboard>
  >

  return <PatientDashboardClient userName={userName} patientData={patientData} />
}
