'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileDown,
  ChevronRight,
  Activity,
  UserPlus,
} from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

interface CompanyDashboardProps {
  userProfile: Profile
  dashboardData?: any // We will type this later
}

const STATS = [
  {
    label: 'Total de Colaboradores',
    value: '42',
    change: '+5 este mês',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Sessões Realizadas',
    value: '128',
    change: '85% de utilização',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Investimento Mensal',
    value: 'R$ 8.420',
    change: 'Dentro do orçamento',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    label: 'Índice de Bem-Estar',
    value: '8.2',
    change: '+0.4 vs mês anterior',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

const RECENT_ACTIVITY = [
  {
    user: 'Ana Silva',
    department: 'Marketing',
    date: 'Hoje, 14:00',
    type: 'Sessão Individual',
    status: 'Agendado',
  },
  {
    user: 'Marcos Oliveira',
    department: 'TI',
    date: 'Ontem',
    type: 'Consulta de Retorno',
    status: 'Concluído',
  },
  {
    user: 'Juliana Costa',
    department: 'RH',
    date: '06 Mar',
    type: 'Primeira Consulta',
    status: 'Concluído',
  },
]

export function CompanyDashboard({ userProfile }: CompanyDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Painel Corporativo
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie o bem-estar da sua equipe e os benefícios da{' '}
            {userProfile.full_name || 'sua empresa'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            Relatório Completo
          </Button>
          <Link href="/dashboard/empresa/colaboradores">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 shadow-lg shadow-blue-600/20 gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar Time
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
                <p className="text-sm text-slate-500">Acompanhamento anônimo de uso</p>
              </div>
              <Link href="/dashboard/empresa/colaboradores">
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50 text-xs font-bold gap-1"
                >
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {RECENT_ACTIVITY.map((act, i) => (
                <div
                  key={i}
                  className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm border border-slate-100 group-hover:border-blue-200 transition-colors">
                      {act.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{act.user}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {act.department} • {act.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 mb-1">{act.date}</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        act.status === 'Concluído'
                          ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                          : 'text-blue-600 bg-blue-50 border border-blue-100'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 h-full flex flex-col">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="mb-8">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Relatório de Impacto</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Visualize como o investimento na saúde mental do seu time está impactando a
                produtividade e retenção.
              </p>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Dados 100% Anônimos</span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl h-14 shadow-lg shadow-blue-600/20 gap-2">
                <FileDown className="h-4 w-4" />
                Baixar Dashboard PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
