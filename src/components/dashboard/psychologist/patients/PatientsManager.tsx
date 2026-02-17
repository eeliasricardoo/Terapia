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
    ChevronRight
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
                                <div className="bg-slate-50 border-b border-slate-200 p-6 pb-0">
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
                                    <TabsContent value="records" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                Anotações
                                            </h3>
                                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Privado (apenas você vê)</span>
                                        </div>

                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Escreva uma nova anotação sobre a sessão de hoje..."
                                                className="min-h-[150px] resize-none border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm rounded-xl p-4 text-base"
                                            />
                                            <div className="flex justify-end">
                                                <Button className="bg-slate-900 text-white shadow-sm hover:bg-slate-800 rounded-lg px-6">Salvar Anotação</Button>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-8 mt-8">
                                            <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                Histórico de Anotações
                                            </h4>
                                            <div className="space-y-4">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 group-hover:border-slate-200 transition-colors">
                                                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> 15 Fev, 2026
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-500 font-medium">Sessão Regular</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600 leading-relaxed">
                                                            Paciente relatou melhoria nos quadros de ansiedade durante a semana.
                                                            Discutimos técnicas de respiração e enfrentamento de situações de estresse no trabalho.
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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
