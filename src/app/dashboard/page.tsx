import { PsychologistDashboard } from "@/components/dashboard/psychologist/PsychologistDashboard"
import { AdminDashboard } from "@/components/dashboard/admin/AdminDashboard"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoodTracker } from "@/components/dashboard/MoodTracker"
import { getCurrentUserProfile } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/server"

import { PatientDashboardHeader } from "./_components/patient-dashboard-header"
import { FindPsychologistCTA } from "./_components/find-psychologist-cta"
import { NextSessionHero } from "./_components/next-session-hero"
import { QuickActions } from "./_components/quick-actions"
import { RecentHistory } from "./_components/recent-history"
import { PaymentStatusToast } from "./_components/payment-status-toast"
import { Suspense } from "react"

import { getPsychologistDashboardData, getPatientDashboardData } from "@/lib/actions/dashboard"

export default async function DashboardPage() {
    let userProfile = await getCurrentUserProfile()

    if (!userProfile) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const metaRole = user.user_metadata?.role as string | undefined
            const validRoles = ['PATIENT', 'PSYCHOLOGIST', 'COMPANY', 'ADMIN']
            const role = (validRoles.includes(metaRole || '') ? metaRole : 'PATIENT') as 'PATIENT' | 'PSYCHOLOGIST' | 'COMPANY' | 'ADMIN'

            userProfile = {
                id: 'temp',
                user_id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                role,
                avatar_url: null,
                phone: null,
                birth_date: null,
                document: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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
        return <AdminDashboard userProfile={userProfile} />
    }

    if (userProfile.role === 'COMPANY') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold">Painel da Empresa</h1>
                <p className="text-slate-500">Este painel está em desenvolvimento.</p>
                <Link href="/dashboard/perfil">
                    <Button>Ir para meu Perfil</Button>
                </Link>
            </div>
        )
    }

    const userName = userProfile?.full_name?.split(' ')[0] || 'Usuário'
    const patientData = await getPatientDashboardData()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Suspense><PaymentStatusToast /></Suspense>
            <PatientDashboardHeader userName={userName} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-8">
                    <FindPsychologistCTA />
                    <NextSessionHero session={patientData.nextSession} />
                    <MoodTracker />
                </div>

                <div className="col-span-1 space-y-8">
                    <QuickActions />
                    <RecentHistory history={patientData.recentSessions} />
                </div>
            </div>
        </div>
    )
}
