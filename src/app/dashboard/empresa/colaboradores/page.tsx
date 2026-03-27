'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail,
  UserMinus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Send,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getCompanyMembers, inviteEmployee } from '../actions'

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    async function loadData() {
      const res = await getCompanyMembers()
      setEmployees(res.success ? res.data : [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.profile?.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendInvite = async () => {
    if (inviteEmail) {
      setSendingInvite(true)
      const res = await inviteEmployee(inviteEmail)
      if (res.success) {
        toast.success(res.message)
        setIsInviteOpen(false)
        setInviteEmail('')
      } else {
        toast.error('Erro ao enviar convite.')
      }
      setSendingInvite(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Gestão de Time
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie colaboradores e envie convites individuais de segurança máxima.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 h-12 font-bold text-slate-600 gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Lista
          </Button>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12 shadow-lg shadow-blue-600/20 gap-2 font-bold">
                <UserPlus className="h-4 w-4" />
                Enviar Convite Único
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-outfit">
                  Enviar Novo Convite
                </DialogTitle>
                <DialogDescription className="font-medium">
                  Gere um token de acesso único e seguro para um colaborador.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">E-mail Corporativo</Label>
                  <Input
                    placeholder="email@empresa.com.br"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="rounded-xl h-12 border-slate-100 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 italic text-xs text-amber-700 font-medium leading-relaxed">
                  Este convite expirará em 48 horas e só poderá ser utilizado por uma única conta
                  associada a este e-mail.
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSendInvite}
                  disabled={sendingInvite}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-bold gap-2"
                >
                  {sendingInvite ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar Token Seguro
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full space-y-8">
        <TabsList className="bg-white border border-slate-100 p-1 rounded-[1.25rem] h-auto w-full md:w-auto">
          <TabsTrigger
            value="active"
            className="rounded-xl px-8 py-3 font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all"
          >
            Ativos ({employees.filter((e) => e.status === 'ACTIVE').length})
          </TabsTrigger>
          <TabsTrigger
            value="invites"
            className="rounded-xl px-8 py-3 font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all"
          >
            Convites Pendentes (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-12 h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-50">
                  <TableHead className="px-8 py-5 font-bold text-slate-900">Colaborador</TableHead>
                  <TableHead className="font-bold text-slate-900">Cargo</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Status</TableHead>
                  <TableHead className="font-bold text-slate-900">Entrou em</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="group hover:bg-slate-50/50 transition-colors border-slate-50"
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                            {emp.profile?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none mb-1">
                              {emp.profile?.full_name || 'Usuário'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {emp.profile?.users?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-medium">
                        {emp.profile?.profession || 'Membro'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${
                            emp.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 font-medium">
                        {new Date(emp.joined_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 shadow-none"
                            >
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50"
                          >
                            <DropdownMenuLabel className="font-bold text-slate-900 px-3 py-2">
                              Ações Corporativas
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-xl focus:bg-red-50 focus:text-red-600 cursor-pointer gap-3 py-2.5 px-3">
                              <UserMinus className="h-4 w-4" /> Remover do Benefício
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="space-y-8">
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Como funcionam os convites?</h3>
                <p className="text-sm text-slate-500 font-medium max-w-xl">
                  Cada colaborador recebe um **Token de Acesso Único** vinculado ao seu e-mail
                  corporativo. Isso garante que apenas pessoas autorizadas utilizem o benefício, com
                  sigilo total.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-xl px-6 h-12 font-bold whitespace-nowrap"
            >
              Novo Convite +
            </Button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-12 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Monitoramento de Segurança</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Ao enviar convites, você poderá ver o status da ativação e o token gerado para cada
              e-mail.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
