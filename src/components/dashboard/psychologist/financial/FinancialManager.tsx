'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  createStripeConnectAccountLink,
  getStripeDashboardLink,
  syncStripeAccountStatus,
} from '@/lib/actions/stripe'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFinancialStats, type FinancialStats } from '@/lib/actions/financial'

export function FinancialManager() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<{
    detailsSubmitted: boolean
    payoutsEnabled: boolean
  } | null>(null)

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    try {
      const result = await createStripeConnectAccountLink(undefined)
      if (!result.success) {
        toast.error(result.error)
      } else if (result.data?.url) {
        window.location.href = result.data.url
      }
    } catch (error) {
      toast.error('Erro ao iniciar conexão com Stripe')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleOpenStripeDashboard = async () => {
    setIsConnecting(true)
    try {
      const result = await getStripeDashboardLink(undefined)
      if (!result.success) {
        toast.error(result.error)
      } else if (result.data?.url) {
        window.open(result.data.url, '_blank')
      }
    } catch (error) {
      toast.error('Erro ao acessar painel financeiro')
    } finally {
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsResult, stripeResult] = await Promise.all([
          getFinancialStats(undefined),
          syncStripeAccountStatus(undefined),
        ])

        if (statsResult.success) {
          setStats(statsResult.data)
        }

        if (stripeResult.success && stripeResult.data) {
          setOnboardingStatus({
            detailsSubmitted: !!stripeResult.data.detailsSubmitted,
            payoutsEnabled: !!stripeResult.data.payoutsEnabled,
          })
        }
      } catch (error) {
        logger.error('Error loading financial stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4 bg-slate-100" />
                <Skeleton className="h-8 w-32 mb-1 bg-slate-200" />
                <Skeleton className="h-3 w-20 bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-40 bg-slate-200" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full rounded-xl bg-slate-100" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36 bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 bg-slate-100" />
                  <Skeleton className="h-4 w-16 bg-slate-200" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-44 bg-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50">
                  <Skeleton className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36 mb-1 bg-slate-200" />
                    <Skeleton className="h-3 w-24 bg-slate-100" />
                  </div>
                  <Skeleton className="h-5 w-20 bg-slate-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro</h2>
          <p className="text-slate-500">Acompanhe seus rendimentos e histórico de pagamentos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[160px] bg-white border-slate-200">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">Este Mês</SelectItem>
              <SelectItem value="last-month">Mês Passado</SelectItem>
              <SelectItem value="last-90">Últimos 90 dias</SelectItem>
              <SelectItem value="this-year">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          {stats.isStripeConnected && (
            <Button
              onClick={handleOpenStripeDashboard}
              disabled={isConnecting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Ver Painel Stripe
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() =>
              toast.info('Recurso de exportação em desenvolvimento', {
                description: 'Em breve você poderá baixar relatórios em CSV e PDF.',
              })
            }
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {stats.isStripeConnected && onboardingStatus && !onboardingStatus.detailsSubmitted && (
        <Card className="border-none bg-amber-50 ring-1 ring-amber-100 shadow-sm overflow-hidden rounded-2xl mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-50">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Configuração Incompleta</p>
                <p className="text-xs text-amber-700">
                  Você iniciou a conexão, mas não terminou de preencher seus dados no Stripe.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleConnectStripe}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9"
            >
              Terminar Cadastro
            </Button>
          </CardContent>
        </Card>
      )}

      {!stats.isStripeConnected && (
        <Card className="border-none bg-blue-50/50 ring-1 ring-blue-100 shadow-sm overflow-hidden rounded-3xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Configure seus recebimentos</h3>
              <p className="text-slate-600 max-w-2xl leading-relaxed">
                Para receber os pagamentos das suas sessões de forma automática e segura, você
                precisa conectar sua conta à nossa plataforma financeira via <strong>Stripe</strong>
                .
              </p>
            </div>
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-2xl shrink-0"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar Stripe'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Receita Total (Mês Atual)</p>
            <h3 className="text-3xl font-bold tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.totalRevenue
              )}
            </h3>
            <div className="flex items-center gap-2 mt-4">
              <Badge
                className={`${stats.revenueChange >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'} hover:bg-opacity-30 border-none`}
              >
                {stats.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(Math.round(stats.revenueChange))}%
              </Badge>
              <span className="text-xs text-slate-400">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                Pendente
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">A Receber</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.pendingRevenue
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-2">Próximos pagamentos previstos</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                Média
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.averageTicket
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-2">Por sessão realizada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Evolução Financeira</CardTitle>
            <CardDescription>Receita bruta dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-end justify-between gap-2 sm:gap-4 mt-4">
              {stats.monthlyData.map((data, index) => {
                const maxVal = Math.max(...stats.monthlyData.map((d) => d.value), 4500)
                const heightPercentage = (data.value / maxVal) * 100
                const isCurrentMonth = index === stats.monthlyData.length - 1

                return (
                  <div key={data.month} className="flex flex-col items-center gap-2 w-full group">
                    <div className="relative w-full max-w-[60px] h-full flex items-end">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${isCurrentMonth ? 'bg-slate-900' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                        style={{ height: `${heightPercentage}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                          R$ {data.value}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${isCurrentMonth ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                      {data.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
            <CardDescription>Preferência dos pacientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.paymentMethods.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Nenhum pagamento registrado ainda.
              </p>
            ) : (
              stats.paymentMethods.map((pm) => {
                const iconMap: Record<
                  string,
                  { bg: string; text: string; Icon: typeof CreditCard }
                > = {
                  Stripe: { bg: 'bg-indigo-50', text: 'text-indigo-600', Icon: CreditCard },
                  Pix: { bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: TrendingUp },
                  'Cartão de Crédito': {
                    bg: 'bg-blue-50',
                    text: 'text-blue-600',
                    Icon: CreditCard,
                  },
                  Boleto: { bg: 'bg-amber-50', text: 'text-amber-600', Icon: CreditCard },
                }
                const style = iconMap[pm.method] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-600',
                  Icon: CreditCard,
                }
                const barColors: Record<string, string> = {
                  Stripe: 'bg-indigo-500',
                  Pix: 'bg-emerald-500',
                  'Cartão de Crédito': 'bg-primary',
                  Boleto: 'bg-amber-500',
                }
                const barColor = barColors[pm.method] || 'bg-slate-400'

                return (
                  <div key={pm.method}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg ${style.bg} flex items-center justify-center ${style.text}`}
                        >
                          <style.Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{pm.method}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{pm.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className={`${barColor} h-2 rounded-full`}
                        style={{ width: `${pm.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Transações Recentes</CardTitle>
              <CardDescription>Histórico dos últimos atendimentos</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
              onClick={() =>
                toast.info('Histórico completo em desenvolvimento', {
                  description: 'Em breve você terá acesso a todas as suas transações passadas.',
                })
              }
            >
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Paciente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {transaction.patient}
                    </TableCell>
                    <TableCell className="text-slate-500">{transaction.date}</TableCell>
                    <TableCell className="text-slate-600">{transaction.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                                                ${transaction.status === 'completed' || transaction.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                ${transaction.status === 'scheduled' || transaction.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                ${transaction.status === 'canceled' || transaction.status === 'refunded' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                            `}
                      >
                        {transaction.status === 'completed' || transaction.status === 'paid'
                          ? 'Recebido'
                          : transaction.status === 'scheduled' || transaction.status === 'pending'
                            ? 'Previsto'
                            : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
