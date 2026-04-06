'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  CreditCard,
  Download,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
} from 'lucide-react'

const INVOICES = [
  {
    id: 'INV-001',
    period: 'Março 2024',
    amount: 'R$ 8.420,00',
    status: 'Processando',
    date: 'Vence em 5 dias',
  },
  {
    id: 'INV-002',
    period: 'Fevereiro 2024',
    amount: 'R$ 7.210,00',
    status: 'Pago',
    date: '05/02/2024',
  },
  {
    id: 'INV-003',
    period: 'Janeiro 2024',
    amount: 'R$ 6.800,00',
    status: 'Pago',
    date: '05/01/2024',
  },
]

export default function CompanyBillingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Financeiro & Faturamento
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie seus planos corporativos, faturas e métodos de pagamento.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 gap-2 h-12 font-bold text-slate-600"
          >
            <Download className="h-4 w-4" />
            Relatório de Gastos (PDF)
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12 shadow-lg shadow-blue-600/20 gap-2 font-bold">
            <CreditCard className="h-4 w-4" />
            Alterar Cartão
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Active Plan Card */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-blue-900/5 bg-slate-900 text-white overflow-hidden border-none lg:col-span-2">
          <CardContent className="p-8 md:p-10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="flex flex-col md:flex-row gap-10 relative z-10">
              <div className="flex-1 space-y-6">
                <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-none font-bold rounded-full text-[10px] uppercase tracking-wider px-3 py-1">
                  Plano Atual: Premium Business
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">
                    R$ 199,00{' '}
                    <span className="text-lg font-medium text-slate-400">/ colaborador</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Faturamento mensal baseado no número de colaboradores ativos.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Próxima Fatura
                    </p>
                    <p className="text-xl font-bold">05 Abr, 2024</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Acumulado Mês
                    </p>
                    <p className="text-xl font-bold">R$ 8.420,00</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-72 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Incluído no Plano
                </h3>
                <ul className="space-y-3">
                  {[
                    'Sessões ilimitadas',
                    'Relatórios de Impacto',
                    'Suporte Prioritário',
                    'Workshops Trimestrais',
                  ].map((item) => (
                    <li key={item} className="text-xs text-slate-300 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl bg-white text-slate-900 hover:bg-blue-50 h-10 text-xs font-bold transition-colors">
                  Upgrade de Plano
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ROI Mental</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Para cada $1 investido em saúde mental, estima-se um retorno de $4 em produtividade.
              </p>
            </div>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-bold text-sm gap-1">
              Ver estudo completo <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">Histórico de Faturas</h2>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Fatura</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Período</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Valor</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Status</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900 text-right">
                  Data / Vencimento
                </th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-slate-900">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">{inv.period}</td>
                  <td className="px-8 py-5 font-bold text-slate-900">{inv.amount}</td>
                  <td className="px-8 py-5">
                    <Badge
                      className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${
                        inv.status === 'Pago'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-blue-50 text-blue-600'
                      } hover:bg-opacity-80 border-none`}
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                    {inv.date}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl hover:bg-white border border-transparent hover:border-slate-100 font-bold text-blue-600 gap-1.5"
                    >
                      XML <Download className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
