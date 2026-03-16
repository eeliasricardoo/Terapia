'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getFinancialStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading financial stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        <p className="text-slate-500 font-medium">Carregando dados financeiros...</p>
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
          <Button
            variant="outline"
            className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

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
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              Ver todas
            </Button>
          </div>
        </CardHeader>
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
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      transaction.amount
                    )}
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
      </Card>
    </div>
  )
}
