"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    ChevronLeft, Mail, Phone, User, Stethoscope,
    Activity, Calendar, Clock, FileText
} from "lucide-react"
import type { PatientData } from "@/lib/actions/patients"
import { AnamnesisTab } from "./AnamnesisTab"
import { EvolutionsTab } from "./EvolutionsTab"
import { SessionHistoryTab } from "./SessionHistoryTab"

interface Props {
    patient: PatientData
}

const STATUS_MAP = {
    active: { label: "Ativo", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    inactive: { label: "Inativo", className: "bg-slate-100 text-slate-600 border-slate-200" },
    archived: { label: "Arquivado", className: "bg-amber-50 text-amber-700 border-amber-200" },
}

export function PatientProfilePage({ patient }: Props) {
    const status = STATUS_MAP[patient.status] || STATUS_MAP.inactive

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container py-3 flex items-center gap-3">
                    <Link
                        href="/dashboard/pacientes"
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Pacientes
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-medium text-slate-800">{patient.name}</span>
                </div>
            </div>

            <div className="container py-8 space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Cover gradient */}
                    <div className="h-28 bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
                    </div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-6">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-1 ring-slate-200">
                                <AvatarImage src={patient.image} />
                                <AvatarFallback className="bg-slate-900 text-white text-3xl font-semibold">
                                    {patient.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pt-2 sm:pt-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                                    <Badge variant="outline" className={status.className}>
                                        {status.label}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        {patient.email}
                                    </span>
                                    {patient.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            {patient.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total de Sessões</p>
                                <p className="text-2xl font-bold text-slate-900">{patient.totalSessions}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Última Sessão
                                </p>
                                <p className="text-sm font-semibold text-slate-900">{patient.lastSession || "—"}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Próxima Sessão
                                </p>
                                <p className="text-sm font-semibold text-emerald-800">{patient.nextSession || "Sem sessão marcada"}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Status
                                </p>
                                <p className="text-sm font-semibold text-blue-800">{status.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="evolution" className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                        <TabsList className="w-full justify-start bg-transparent gap-1 h-auto flex-wrap">
                            <TabsTrigger
                                value="evolution"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                <Activity className="h-4 w-4" />
                                Evoluções & Prontuário
                            </TabsTrigger>
                            <TabsTrigger
                                value="anamnesis"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                <Stethoscope className="h-4 w-4" />
                                Anamnese
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                <Calendar className="h-4 w-4" />
                                Histórico de Sessões
                            </TabsTrigger>
                            <TabsTrigger
                                value="info"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                <FileText className="h-4 w-4" />
                                Ficha Pessoal
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Evoluções */}
                    <TabsContent value="evolution" className="mt-0">
                        <EvolutionsTab patientId={patient.id} />
                    </TabsContent>

                    {/* Anamnese */}
                    <TabsContent value="anamnesis" className="mt-0">
                        <AnamnesisTab patientId={patient.id} />
                    </TabsContent>

                    {/* Histórico */}
                    <TabsContent value="history" className="mt-0">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <SessionHistoryTab patientId={patient.id} />
                        </div>
                    </TabsContent>

                    {/* Ficha Pessoal */}
                    <TabsContent value="info" className="mt-0">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    Ficha Cadastral
                                </CardTitle>
                                <CardDescription>Dados pessoais do paciente.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Completo</label>
                                            <Input defaultValue={patient.name} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CPF</label>
                                            <Input defaultValue={patient.document || ""} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data de Nascimento</label>
                                            <Input defaultValue={patient.birthDate || ""} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gênero</label>
                                            <Input defaultValue={patient.gender || ""} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                                        <Input defaultValue={patient.email} className="bg-slate-50 border-slate-200" readOnly />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Telefone</label>
                                            <Input defaultValue={patient.phone} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profissão</label>
                                            <Input defaultValue={patient.profession || ""} className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Endereço</label>
                                        <Input defaultValue={patient.address?.line || ""} className="bg-slate-50 border-slate-200" readOnly />
                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                            <Input defaultValue={patient.address?.city || ""} placeholder="Cidade" className="bg-slate-50 border-slate-200" readOnly />
                                            <Input defaultValue={patient.address?.state || ""} placeholder="Estado" className="bg-slate-50 border-slate-200" readOnly />
                                            <Input defaultValue={patient.address?.zip || ""} placeholder="CEP" className="bg-slate-50 border-slate-200" readOnly />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
