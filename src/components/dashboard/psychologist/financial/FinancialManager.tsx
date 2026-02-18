"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    MoreHorizontal
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- Mock Data ---

const TRANSACTIONS = [
    { id: "1", patient: "Ana Silva", date: "15 Fev, 2026", amount: 150.00, status: "paid", method: "Cartão de Crédito" },
    { id: "2", patient: "Carlos Oliveira", date: "14 Fev, 2026", amount: 150.00, status: "pending", method: "Pix" },
    { id: "3", patient: "Pedro Santos", date: "12 Fev, 2026", amount: 120.00, status: "paid", method: "Cartão de Crédito" },
    { id: "4", patient: "Mariana Costa", date: "10 Fev, 2026", amount: 150.00, status: "paid", method: "Boleto" },
    { id: "5", patient: "Julia Lima", date: "09 Fev, 2026", amount: 150.00, status: "refunded", method: "Cartão de Crédito" },
]

const MONTHLY_DATA = [
    { month: "Set", value: 2400 },
    { month: "Out", value: 3100 },
    { month: "Nov", value: 2800 },
    { month: "Dez", value: 3600 },
    { month: "Jan", value: 3200 },
    { month: "Fev", value: 4100 },
]

export function FinancialManager() {
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
                    <Button variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
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
                        <p className="text-slate-400 text-sm font-medium mb-1">Receita Total (Fev)</p>
                        <h3 className="text-3xl font-bold tracking-tight">R$ 4.100,00</h3>
                        <div className="flex items-center gap-2 mt-4">
                            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-none">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12%
                            </Badge>
                            <span className="text-xs text-slate-400">vs. mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">Pendente</Badge>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">A Receber</p>
                        <h3 className="text-2xl font-bold text-slate-900">R$ 450,00</h3>
                        <p className="text-xs text-slate-400 mt-2">Próximos pagamentos previstos</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">Média</Badge>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Ticket Médio</p>
                        <h3 className="text-2xl font-bold text-slate-900">R$ 146,00</h3>
                        <p className="text-xs text-slate-400 mt-2">Por sessão realizada</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart (Simple CSS Bar Chart) */}
                <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Evolução Financeira</CardTitle>
                        <CardDescription>Receita bruta dos últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full flex items-end justify-between gap-2 sm:gap-4 mt-4">
                            {MONTHLY_DATA.map((data, index) => {
                                // Calculate height relative to max value (approx 4500)
                                const heightPercentage = (data.value / 4500) * 100
                                const isCurrentMonth = index === MONTHLY_DATA.length - 1

                                return (
                                    <div key={data.month} className="flex flex-col items-center gap-2 w-full group">
                                        <div className="relative w-full max-w-[60px] h-full flex items-end">
                                            <div
                                                className={`w-full rounded-t-md transition-all duration-500 ${isCurrentMonth ? 'bg-slate-900' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                                                style={{ height: `${heightPercentage}%` }}
                                            >
                                                {/* Tooltip on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                                    R$ {data.value}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium ${isCurrentMonth ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {data.month}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Info / Mini List */}
                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
                        <CardDescription>Preferência dos pacientes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Cartão de Crédito</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">65%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Pix</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">25%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Outros</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">10%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Transações Recentes</CardTitle>
                            <CardDescription>Histórico dos últimos 30 dias</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Ver todas</Button>
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
                        {TRANSACTIONS.map((transaction) => (
                            <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium text-slate-900">{transaction.patient}</TableCell>
                                <TableCell className="text-slate-500">{transaction.date}</TableCell>
                                <TableCell className="text-slate-600">{transaction.method}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${transaction.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${transaction.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${transaction.status === 'refunded' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        `}
                                    >
                                        {transaction.status === 'paid' ? 'Pago' : transaction.status === 'pending' ? 'Pendente' : 'Estornado'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium text-slate-900">
                                    R$ {transaction.amount.toFixed(2).replace('.', ',')}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
