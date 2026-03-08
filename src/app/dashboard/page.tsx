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
import { QuickActions } from './_components/quick-actions'
import { RecentHistory } from './_components/recent-history'
import { PaymentStatusToast } from './_components/payment-status-toast'
import { Suspense } from 'react'

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
        redirect('/cadastro/profissional/completar-perfil')
      } else {
        redirect('/onboarding')
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
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Painel Corporativo
            </h1>
            <p className="text-slate-500 font-medium">Gestão de bem-estar emocional da empresa</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/perfil">
              <Button variant="outline" className="rounded-full">
                Ver Perfil
              </Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 shadow-lg shadow-blue-600/20">
              Adicionar Colaboradores
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Colaboradores', value: '42', change: '+5 este mês', color: 'bg-blue-500' },
            {
              label: 'Sessões Ativas',
              value: '128',
              change: '85% utilização',
              color: 'bg-emerald-500',
            },
            {
              label: 'Investimento',
              value: 'R$ 8.4k',
              change: 'Efetividade 92%',
              color: 'bg-indigo-500',
            },
            { label: 'NPS Médio', value: '9.8', change: '+0.2 vs out', color: 'bg-amber-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-1.5 h-full ${stat.color} opacity-20`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
                  <p className="text-sm text-slate-500">Uso dos benefícios pelos colaboradores</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50 text-xs font-bold"
                >
                  Ver Tudo
                </Button>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  {
                    user: 'Ana Silva',
                    date: 'Hoje, 14:00',
                    type: 'Sessão Individual',
                    status: 'Agendado',
                  },
                  {
                    user: 'Marcos Oliveira',
                    date: 'Ontem',
                    type: 'Meditação Guiada',
                    status: 'Concluído',
                  },
                  {
                    user: 'Juliana Costa',
                    date: '06 Mar',
                    type: 'Primeira Consulta',
                    status: 'Concluído',
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-200">
                        {act.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{act.user}</p>
                        <p className="text-xs text-slate-500">{act.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{act.date}</p>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full">
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 space-y-6 flex flex-col h-full">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Relatório de Impacto</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Exportamos mensalmente dados anônimos sobre o nível de estresse e produtividade
                    da sua equipe.
                  </p>
                </div>
                <div className="mt-auto">
                  <Button className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-xl shadow-lg h-12">
                    Gerar PDF Mensal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
