'use client'

import { AdminVerificationManager } from './AdminVerificationManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, ShieldCheck, Activity, Calendar, LayoutDashboard } from 'lucide-react'

import { AdminDashboardData } from '@/lib/actions/dashboard'

interface Props {
  userProfile: any
  dashboardData: AdminDashboardData
}

export function AdminDashboard({ userProfile, dashboardData }: Props) {
  const userName =
    (userProfile?.full_name || (userProfile as any)?.fullName || '').split(' ')[0] || 'Admin'

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Painel Administrativo
          </h1>
          <p className="text-slate-500 mt-2">
            Bem-vindo(a), {userName}. Gestão global da plataforma Mind Cares.
          </p>
        </div>
        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md transition-colors">
          <LayoutDashboard className="h-5 w-5" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Usuários"
          value={dashboardData.totalUsers}
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Psicólogos Verificados"
          value={dashboardData.verifiedPsychologists}
          icon={ShieldCheck}
          color="slate"
        />
        <StatCard
          title="Sessões Ativas"
          value={dashboardData.activeSessions}
          icon={Activity}
          color="slate"
        />
        <StatCard
          title="Total Agendamentos"
          value={dashboardData.totalAppointments}
          icon={Calendar}
          color="slate"
        />
        <StatCard
          title="Faturamento Bruto"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            dashboardData.totalRevenue
          )}
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="Receita Plataforma"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            dashboardData.platformProfit
          )}
          icon={ShieldCheck}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AdminVerificationManager />
        </div>
        <div className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Atalhos Administrativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/admin/psicologos">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-600 gap-3 border-slate-200"
                >
                  <Users className="h-4 w-4" /> Gerenciar Psicólogos
                </Button>
              </Link>
              <Link href="/dashboard/admin/aprovacoes">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-600 gap-3 border-slate-200"
                >
                  <ShieldCheck className="h-4 w-4" /> Aprovações Pendentes
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-slate-600 gap-3 border-slate-200"
                disabled
              >
                <Activity className="h-4 w-4" /> Histórico de Sessões
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50 text-slate-900 ring-1 ring-slate-100">
            <CardContent className="p-6">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Dica do Sistema
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Psicólogos verificados aparecem instantaneamente na página de busca pública para
                todos os pacientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    slate: 'bg-slate-50 text-slate-500 ring-1 ring-slate-100',
    primary: 'bg-primary/5 text-primary',
  }

  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">{title}</span>
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${colors[color as keyof typeof colors]}`}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  )
}
