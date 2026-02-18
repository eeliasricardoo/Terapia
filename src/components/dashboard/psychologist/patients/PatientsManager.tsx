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

// --- Types ---
type PatientStatus = 'active' | 'inactive' | 'archived'

interface Patient {
    id: string
    name: string
    email: string
    phone: string
    image?: string
    status: PatientStatus
    lastSession?: string
    nextSession?: string
    totalSessions: number
}

// --- Mock Data ---
const MOCK_PATIENTS: Patient[] = [
    {
        id: "1",
        name: "Ana Silva",
        email: "ana.silva@email.com",
        phone: "(11) 99999-1111",
        status: "active",
        lastSession: "15 Fev, 2026",
        nextSession: "22 Fev, 2026 - 14:00",
        totalSessions: 12
    },
    {
        id: "2",
        name: "Carlos Oliveira",
        email: "carlos.oli@email.com",
        phone: "(11) 98888-2222",
        status: "active",
        lastSession: "10 Fev, 2026",
        nextSession: "17 Fev, 2026 - 09:00",
        totalSessions: 4
    },
    {
        id: "3",
        name: "Mariana Costa",
        email: "mari.costa@email.com",
        phone: "(21) 97777-3333",
        status: "inactive",
        lastSession: "20 Jan, 2026",
        totalSessions: 8
    },
    {
        id: "4",
        name: "Pedro Santos",
        email: "pedro.s@email.com",
        phone: "(31) 96666-4444",
        status: "active",
        lastSession: "12 Fev, 2026",
        nextSession: "19 Fev, 2026 - 16:00",
        totalSessions: 2
    }
]

export function PatientsManager() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const filteredPatients = MOCK_PATIENTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handlePatientClick = (patient: Patient) => {
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
                <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Novo Paciente
                </Button>
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
                                        <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700 shadow-sm font-medium">
                                            {selectedPatient.totalSessions} Sessões
                                        </Badge>
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
                                                <Button size="sm" className="h-8 gap-2 bg-slate-900 text-white hover:bg-slate-800">
                                                    <FilePlus className="h-3.5 w-3.5" />
                                                    Nova Evolução
                                                </Button>
                                            </div>

                                            <ScrollArea className="flex-1 pr-4 -mr-4">
                                                <TabsContent value="evolution" className="space-y-6 mt-0">
                                                    {/* New Evolution Area */}
                                                    <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                                                        <CardHeader className="pb-3 pt-4 px-4 bg-white border-b border-slate-100 rounded-t-xl">
                                                            <div className="flex justify-between items-center">
                                                                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                                    <Activity className="h-4 w-4 text-blue-600" />
                                                                    Registro de Sessão
                                                                </CardTitle>
                                                                <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleDateString('pt-BR')}</span>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4 p-4">
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 mb-2 block uppercase tracking-wide">Como o paciente chegou hoje?</label>
                                                                <div className="flex gap-2">
                                                                    {[
                                                                        { icon: Smile, label: 'Bem', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
                                                                        { icon: Meh, label: 'Neutro', color: 'text-amber-500 bg-amber-50 border-amber-200' },
                                                                        { icon: Frown, label: 'Mal', color: 'text-red-500 bg-red-50 border-red-200' },
                                                                        { icon: AlertCircle, label: 'Crise', color: 'text-purple-500 bg-purple-50 border-purple-200' },
                                                                    ].map((mood) => (
                                                                        <button key={mood.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white hover:shadow-sm group`}>
                                                                            <mood.icon className={`h-4 w-4 ${mood.color.split(' ')[0]} grayscale group-hover:grayscale-0 transition-all`} />
                                                                            <span className="text-xs font-medium text-slate-600">{mood.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500 block uppercase tracking-wide">Resumo da Sessão (Público no Prontuário)</label>
                                                                    <Textarea
                                                                        placeholder="O que foi discutido hoje?"
                                                                        className="min-h-[100px] text-sm resize-none bg-white focus:bg-white"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500 block uppercase tracking-wide flex items-center gap-2">
                                                                        Análise Técnica Privada
                                                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-100 text-slate-500 border-slate-200">Sigiloso</Badge>
                                                                    </label>
                                                                    <Textarea
                                                                        placeholder="Suas impressões técnicas..."
                                                                        className="min-h-[100px] text-sm resize-none bg-amber-50/30 border-amber-100 focus:bg-amber-50/50 focus:border-amber-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end pt-2">
                                                                <Button size="sm" className="bg-slate-900 text-white">Salvar Registro</Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Timeline */}
                                                    <div className="space-y-6 pt-2">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Histórico Recente</h3>
                                                        <div className="relative border-l border-slate-200 ml-4 space-y-8 pl-8 pb-4">
                                                            {[1, 2].map((i) => (
                                                                <div key={i} className="relative group">
                                                                    <div className="absolute -left-[37px] top-0 h-3 w-3 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-all shadow-sm z-10 box-content" />
                                                                    <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-100">
                                                                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                                                            <div className="flex items-center gap-3">
                                                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Sessão Regular</Badge>
                                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3" /> 15 Fev • 14:00
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none flex items-center gap-1 px-2">
                                                                                    <Smile className="h-3 w-3" /> Bem
                                                                                </Badge>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent className="p-4 pt-2">
                                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                                Paciente relatou melhora significativa na ansiedade social. Discutimos a exposição gradual a situações de trabalho.
                                                                            </p>
                                                                            <div className="mt-3 pt-3 border-t border-slate-50">
                                                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Análise Técnica</p>
                                                                                <p className="text-xs text-slate-500 italic">
                                                                                    Nota-se avanço na estruturação cognitiva. Manter foco em TCC nas próximas sessões.
                                                                                </p>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="anamnesis" className="space-y-6 mt-0">
                                                    <Card className="border-slate-200 shadow-sm">
                                                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                                            <CardTitle className="text-base flex items-center gap-2">
                                                                <Stethoscope className="h-4 w-4 text-blue-600" />
                                                                Anamnese & Histórico
                                                            </CardTitle>
                                                            <CardDescription>Informações coletadas na primeira sessão.</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="p-6 space-y-6">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">Queixa Principal</label>
                                                                <Textarea
                                                                    className="bg-slate-50 border-slate-200 focus:bg-white min-h-[80px] resize-none"
                                                                    defaultValue="Ansiedade excessiva relacionada ao trabalho e dificuldade de dormir."
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-slate-700">Histórico Familiar</label>
                                                                    <Textarea
                                                                        className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                                                                        defaultValue="Mãe com histórico de depressão. Pai falecido (infarto)."
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-slate-700">Medicamentos em Uso</label>
                                                                    <Textarea
                                                                        className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                                                                        defaultValue="Sertralina 50mg (manhã)."
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">Hipótese Diagnóstica</label>
                                                                <Input
                                                                    className="bg-slate-50 border-slate-200 focus:bg-white"
                                                                    defaultValue="TAG (Transtorno de Ansiedade Generalizada) - F41.1"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button variant="outline" className="text-slate-600">Atualizar Anamnese</Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
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
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 text-lg">Sessões Realizadas</h3>
                                            <Button variant="outline" size="sm" className="h-8 text-xs">Exportar Histórico</Button>
                                        </div>

                                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-8 py-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="relative group">
                                                    <div className="absolute -left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors shadow-sm z-10" />
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-900 text-sm">Sessão de Terapia Individual</p>
                                                                <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 h-5 px-1.5 hover:bg-emerald-100">Confirmada</Badge>
                                                            </div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                                <Calendar className="h-3.5 w-3.5" /> 10 de Fevereiro de 2026
                                                                <span className="text-slate-300">•</span>
                                                                <Clock className="h-3.5 w-3.5" /> 14:00 - 14:50
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-2">
                                                                Dr. Admin Teste
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-slate-900">R$ 150,00</p>
                                                            <p className="text-xs text-slate-400">Pago via Cartão</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                                    <Input defaultValue="123.456.789-00" className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data de Nascimento</label>
                                                    <Input defaultValue="12/05/1990" className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gênero</label>
                                                    <Input defaultValue="Feminino" className="bg-slate-50 border-slate-200" readOnly />
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
                                                    <Input defaultValue="Designer Gráfico" className="bg-slate-50 border-slate-200" readOnly />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Endereço</label>
                                                <Input defaultValue="Rua das Flores, 123 - Apto 45" className="bg-slate-50 border-slate-200" readOnly />
                                                <div className="grid grid-cols-3 gap-6 mt-2">
                                                    <Input defaultValue="São Paulo" className="bg-slate-50 border-slate-200" readOnly />
                                                    <Input defaultValue="SP" className="bg-slate-50 border-slate-200" readOnly />
                                                    <Input defaultValue="01234-567" className="bg-slate-50 border-slate-200" readOnly />
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
