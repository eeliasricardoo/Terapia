"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    Search,
    Plus,
    MoreHorizontal,
    Calendar,
    FileText,
    Phone,
    Mail,
    Clock,
    ChevronRight,
    Smile,
    Meh,
    Frown,
    AlertCircle,
    List,
    Activity,
    FilePlus,
    Stethoscope
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PatientData } from "@/lib/actions/patients"
import { AnamnesisTab } from "./AnamnesisTab"
import { EvolutionsTab } from "./EvolutionsTab"
import { SessionHistoryTab } from "./SessionHistoryTab"
import Link from "next/link"

export function PatientsManager({ initialPatients }: { initialPatients: PatientData[] }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const filteredPatients = initialPatients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handlePatientClick = (patient: PatientData) => {
        setSelectedPatient(patient)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pacientes</h2>
                    <p className="text-slate-500">Gerencie seus pacientes e acesse os prontuários.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>
                {/* Add more filters here if needed */}
            </div>

            {/* Patients List */}
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Paciente</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Última Sessão</TableHead>
                            <TableHead>Próxima Sessão</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <TableRow
                                key={patient.id}
                                className="cursor-pointer hover:bg-slate-50/50 group transition-colors"
                                onClick={() => handlePatientClick(patient)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-100">
                                            <AvatarImage src={patient.image} />
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                                                {patient.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">{patient.name}</p>
                                            <p className="text-xs text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${patient.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${patient.status === 'inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                                        `}
                                    >
                                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {patient.lastSession || '-'}
                                </TableCell>
                                <TableCell>
                                    {patient.nextSession ? (
                                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm bg-blue-50 w-fit px-2 py-1 rounded-md">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {patient.nextSession}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm italic">Não agendada</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-900">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Patient Details Sheet (Prontuário Rápido) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[800px] sm:max-w-[600px] overflow-y-auto p-0 border-l border-slate-200 shadow-2xl">
                    {selectedPatient && (
                        <div className="flex flex-col h-full bg-white">
                            <Tabs defaultValue="records" className="flex flex-col h-full">
                                {/* Header */}
                                <div className="bg-slate-50 border-b border-slate-200 p-6 pr-12 pb-0">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-slate-900 text-white text-xl font-medium">
                                                    {selectedPatient.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedPatient.name}</h2>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                    <Mail className="h-3.5 w-3.5" /> {selectedPatient.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                                    <Phone className="h-3.5 w-3.5" /> {selectedPatient.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700 shadow-sm font-medium">
                                                {selectedPatient.totalSessions} Sessões
                                            </Badge>
                                            <Link
                                                href={`/dashboard/pacientes/${selectedPatient.id}`}
                                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
                                                onClick={() => setIsSheetOpen(false)}
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                                Ver perfil completo
                                            </Link>
                                        </div>
                                    </div>

                                    <TabsList className="w-full justify-start h-11 bg-transparent p-0 border-b border-transparent gap-6">
                                        <TabsTrigger
                                            value="records"
                                            className="px-1 pb-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                                        >
                                            Prontuário & Anotações
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="history"
                                            className="px-1 pb-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                                        >
                                            Histórico de Sessões
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="info"
                                            className="px-1 pb-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                                        >
                                            Dados Pessoais
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 overflow-y-auto bg-white">
                                    <TabsContent value="records" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
                                        <Tabs defaultValue="evolution" className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-4 px-1">
                                                <TabsList className="bg-slate-100 p-1 rounded-lg">
                                                    <TabsTrigger value="evolution" className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Evoluções</TabsTrigger>
                                                    <TabsTrigger value="anamnesis" className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Anamnese</TabsTrigger>
                                                    <TabsTrigger value="files" className="text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Arquivos</TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <ScrollArea className="flex-1 pr-4 -mr-4">
                                                <TabsContent value="evolution" className="space-y-6 mt-0">
                                                    <EvolutionsTab patientId={selectedPatient.id} />
                                                </TabsContent>

                                                <TabsContent value="anamnesis" className="space-y-6 mt-0">
                                                    <AnamnesisTab patientId={selectedPatient.id} />
                                                </TabsContent>

                                                <TabsContent value="files" className="space-y-6 mt-0">
                                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                            <FilePlus className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                        <h3 className="text-sm font-medium text-slate-900">Nenhum arquivo anexado</h3>
                                                        <p className="text-xs text-slate-500 mt-1 mb-4 text-center max-w-[200px]">
                                                            Faça upload de exames, encaminhamentos ou documentos assinados.
                                                        </p>
                                                        <Button size="sm" variant="outline">Fazer Upload</Button>
                                                    </div>
                                                </TabsContent>
                                            </ScrollArea>
                                        </Tabs>
                                    </TabsContent>

                                    <TabsContent value="history" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <SessionHistoryTab patientId={selectedPatient.id} />
                                    </TabsContent>

                                    <TabsContent value="info" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-900 text-lg">Ficha Cadastral</h3>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Editar Dados</Button>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Completo</label>
                                                    <Input defaultValue={selectedPatient.name} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CPF</label>
                                                    <Input defaultValue={selectedPatient.document || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data de Nascimento</label>
                                                    <Input defaultValue={selectedPatient.birthDate || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gênero</label>
                                                    <Input defaultValue={selectedPatient.gender || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                                                <Input defaultValue={selectedPatient.email} className="bg-slate-50 border-slate-200" readOnly />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Telefone</label>
                                                    <Input defaultValue={selectedPatient.phone} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profissão</label>
                                                    <Input defaultValue={selectedPatient.profession || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Endereço</label>
                                                <Input defaultValue={selectedPatient.address?.line || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                <div className="grid grid-cols-3 gap-6 mt-2">
                                                    <Input defaultValue={selectedPatient.address?.city || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                    <Input defaultValue={selectedPatient.address?.state || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                    <Input defaultValue={selectedPatient.address?.zip || ""} className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
