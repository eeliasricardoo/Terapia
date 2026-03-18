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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-2">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Olá, {userName}.
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                Você tem {stats.sessionsToday}{' '}
                {stats.sessionsToday === 1 ? 'atendimento agendado' : 'atendimentos agendados'} para
                hoje.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/ajustes"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
                <span
                  className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-slate-50"
                  aria-hidden="true"
                />
                <span className="sr-only">Você tem novas notificações</span>
              </Button>
              <Button className="ml-2 gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 transition-all hover:translate-y-[-1px] shadow-lg shadow-slate-200">
                <Video className="h-4 w-4" />
                <span>Sala Virtual</span>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Sessões
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.sessionsToday}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
                  HOJE
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Pacientes Ativos
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.activePatients}</span>
                <span className="text-[10px] text-slate-500 font-bold">
                  TOTAL {stats.totalPatients}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Receita
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(stats.monthlyRevenue)}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Desempenho
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {stats.revenueChange >= 0 ? '+' : ''}
                  {stats.revenueChange}%
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stats.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}
                >
                  MENSAL
                </span>
              </div>
            </div>
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
                        {/* Time & Session Info */}
                        <div className="flex-1 flex items-center justify-between px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
                              <span
                                className={`text-xl font-black ${isNext ? 'text-slate-900' : 'text-slate-500'}`}
                              >
                                {startTimeStr}
                              </span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                {session.duration} MIN
                              </span>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-100 hidden md:block mx-2" />

                            <Avatar
                              className={`h-12 w-12 grayscale hover:grayscale-0 transition-all ${isNext ? 'grayscale-0 ring-2 ring-primary ring-offset-2' : ''}`}
                            >
                              <AvatarImage src={session.image} />
                              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                {session.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h4
                                className={`font-bold text-base ${isNext ? 'text-slate-900' : 'text-slate-700'}`}
                              >
                                {session.patientName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500">
                                  {session.type}
                                </span>
                                {session.status === 'completed' && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-50 text-emerald-600 border-none text-[9px] h-4 font-black uppercase tracking-tighter"
                                  >
                                    Concluída
                                  </Badge>
                                )}
                                {session.status === 'scheduled' && isNext && (
                                  <Badge className="bg-slate-900 text-white border-none text-[9px] h-4 font-black uppercase tracking-tighter">
                                    Próxima
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isNext ? (
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <Link href={`/sala/${session.id}`} className="flex-1">
                                  <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 h-9 shadow-md shadow-slate-200 text-xs font-black uppercase tracking-tighter transition-all hover:scale-105 w-full"
                                  >
                                    <Video className="w-3 h-3 mr-2" />
                                    Iniciar
                                  </Button>
                                </Link>
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
                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-bold text-xs h-9 px-3"
                                  >
                                    Reagendar
                                  </Button>
                                </RescheduleDialog>
                              </div>
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
                      <CalendarIcon className="h-6 w-6 text-slate-400" />
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
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
