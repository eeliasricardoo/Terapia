import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  Calendar as CalendarIcon,
  Users,
  Clock,
  CreditCard,
  MoreHorizontal,
  Star,
  Settings,
  FileText,
  CheckCircle2,
  ArrowRight,
  Bell,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/lib/supabase/types'

import { PsychologistDashboardData } from '@/lib/actions/dashboard'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface Props {
  userProfile: Profile
  dashboardData: PsychologistDashboardData
}

export function PsychologistDashboard({ userProfile, dashboardData }: Props) {
  const userName = userProfile?.full_name?.split(' ')[0] || 'Doutor(a)'

  const { stats, upcomingSessions, recentPatients } = dashboardData

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {!dashboardData.isVerified ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Perfil em Análise
          </h2>
          <p className="text-slate-500 max-w-lg mb-8 leading-relaxed">
            Seus dados e documentos (CRP) foram recebidos com sucesso e estão sendo validados por
            nossa equipe de especialistas. Você receberá um e-mail assim que seu acesso for aprovado
            e você puder começar a atender pacientes pela plataforma.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm shadow-slate-100 max-w-md w-full text-left">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Próximos Passos
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">1.</span>
                Validação do registro profissional (CRP).
              </li>
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">2.</span>
                Aprovação do seu perfil público e especialidades.
              </li>
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-slate-300 font-bold">3.</span>
                Liberação da sua agenda para marcações de pacientes.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Painel do Profissional
              </h1>
              <p className="text-slate-500 mt-2">
                Bem-vindo(a), {userName}. Você tem {stats.sessionsToday}{' '}
                {stats.sessionsToday === 1 ? 'atendimento' : 'atendimentos'} hoje.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="icon"
                className="relative border-slate-200 text-slate-600 hover:text-slate-900"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/dashboard/ajustes">
                <Button
                  variant="outline"
                  className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  Ajustes
                </Button>
              </Link>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 border border-transparent transition-all">
                <Video className="h-4 w-4" />
                Sala Virtual
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Sessões (Hoje)</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stats.sessionsToday}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Pacientes Ativos</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stats.activePatients}
                  </h3>
                  <span className="text-xs text-slate-400">Total {stats.totalPatients}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Receita Estimada (Mês)</span>
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    }).format(stats.monthlyRevenue)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Variação Receita</span>
                  <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stats.revenueChange >= 0 ? '+' : ''}
                    {stats.revenueChange}%
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${stats.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
                  >
                    {stats.revenueChange >= 0 ? 'vs. mês anterior' : 'vs. mês anterior'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Schedule */}
            <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-white pb-5 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Agenda de Hoje
                    </CardTitle>
                    <CardDescription>
                      {new Intl.DateTimeFormat('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      }).format(new Date())}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/90 hover:bg-primary/10 font-medium text-xs"
                    asChild
                  >
                    <Link href="/dashboard/agenda">VER AGENDA &rarr;</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="flex flex-col">
                  {upcomingSessions.map((session, index) => {
                    const isNext = index === 0 && session.status === 'scheduled'
                    const scheduledDate = new Date(session.scheduledAt)
                    const startTimeStr = formatInTimeZone(
                      scheduledDate,
                      dashboardData.timezone,
                      'HH:mm'
                    )
                    return (
                      <div
                        key={session.id}
                        className={`
                                            flex items-stretch 
                                            ${isNext ? 'bg-primary/5' : 'bg-white'} 
                                            border-b border-slate-100 last:border-0 transition-colors
                                        `}
                      >
                        {/* Time Column */}
                        <div className="w-24 relative flex flex-col items-center justify-center py-6 border-r border-slate-100/50">
                          <span
                            className={`text-lg font-bold ${isNext ? 'text-primary' : 'text-slate-700'}`}
                          >
                            {startTimeStr}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1 bg-slate-100 px-1.5 py-0.5 rounded text-center min-w-[3rem]">
                            {session.duration} MIN
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-between p-6">
                          <div className="flex items-center gap-4">
                            <Avatar
                              className={`h-12 w-12 border-2 ${isNext ? 'border-primary/20' : 'border-slate-100'}`}
                            >
                              <AvatarImage src={session.image} />
                              <AvatarFallback
                                className={`${isNext ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {session.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h4
                                className={`font-semibold text-base ${isNext ? 'text-primary/90' : 'text-slate-900'}`}
                              >
                                {session.patientName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">{session.type}</span>
                                {session.status === 'completed' && (
                                  <div className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Concluída
                                  </div>
                                )}
                                {session.status === 'scheduled' && (
                                  <div className="flex items-center text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Agendada
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isNext ? (
                              <Link href={`/sala/${session.id}`} className="w-full">
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-9 shadow-md shadow-primary/20 text-xs font-semibold transition-all hover:scale-105 w-full"
                                >
                                  <Video className="w-3 h-3 mr-2" />
                                  Iniciar Atendimento
                                </Button>
                              </Link>
                            ) : (
                              <RescheduleDialog
                                session={{
                                  id: session.id,
                                  doctor: session.patientName,
                                  role: 'Paciente',
                                  image: session.image || '/avatars/01.png',
                                  date: format(
                                    new Date(session.scheduledAt),
                                    "dd 'de' MMMM, yyyy",
                                    { locale: ptBR }
                                  ),
                                  time: session.time,
                                  psychologistId: session.psychologistId,
                                }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary/90 hover:bg-primary/5 font-bold text-xs"
                                >
                                  Reagendar
                                </Button>
                              </RescheduleDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {upcomingSessions.length === 0 && (
                  <div className="p-12 text-center bg-slate-50/50">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                      <CalendarIcon className="h-6 w-6 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Agenda livre</h3>
                    <p className="text-slate-500 text-xs mt-1">Nenhum atendimento para hoje.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions / Recent Patients */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-2 border-b border-slate-50 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-3">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-10 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 px-3 transition-colors"
                      asChild
                    >
                      <Link href="/dashboard/agenda">
                        <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3">
                          <CalendarIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Gerenciar Horários</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-10 text-slate-600 hover:bg-pink-50 hover:text-pink-700 px-3 transition-colors"
                      asChild
                    >
                      <Link href="/dashboard/pacientes">
                        <div className="h-6 w-6 rounded bg-pink-50 text-pink-600 flex items-center justify-center mr-3">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Meus Pacientes</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-2 border-b border-slate-50 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Histórico Recente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {recentPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                              {patient.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {patient.lastSession}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-500 hover:text-slate-900 text-xs font-medium h-8"
                      asChild
                    >
                      <Link href="/dashboard/pacientes">Ver todos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
