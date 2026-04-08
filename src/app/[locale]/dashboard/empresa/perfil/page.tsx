'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  ShieldCheck,
  Users,
  Calendar,
  Building,
  Plus,
  Trash2,
  Lock,
  Eye,
  Globe,
  Loader2,
} from 'lucide-react'
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
import { getCompanyProfile, updateCompanyBenefit } from '../actions'

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    name?: string | null
    cnpj?: string | null
    benefitConfig?: {
      sessionsPerMonth?: number
      allowedDomains?: string[]
      [key: string]: unknown
    } | null
    _count?: { members: number }
    user?: { email?: string | null }
  } | null>(null)
  const [domains, setDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      const res = await getCompanyProfile()
      const data = res.success ? res.data : null
      if (data) {
        setProfile(data)
        const config = data.benefitConfig as { allowedDomains?: string[] } | null
        setDomains(config?.allowedDomains || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleAddDomain = () => {
    if (newDomain && !domains.includes(newDomain)) {
      setDomains([...domains, newDomain])
      setNewDomain('')
      toast.success('Domínio adicionado!')
    }
  }

  const handleRemoveDomain = (domain: string) => {
    setDomains(domains.filter((d) => d !== domain))
    toast.error('Domínio removido.')
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    const res = await updateCompanyBenefit({
      ...((profile?.benefitConfig as Record<string, unknown>) || {}),
      allowedDomains: domains,
    })

    if (res.success) {
      toast.success('Configurações de segurança salvas!')
    } else {
      toast.error('Erro ao salvar configurações.')
    }
    setIsSaving(false)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-700">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-outfit mb-2">
          Perfil da Empresa
        </h1>
        <p className="text-slate-500 font-medium">
          Configure a identidade da sua organização e as regras do benefício.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Advanced Access Control Container */}
        <div className="lg:col-span-3">
          <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-blue-900/5 bg-slate-900 text-white overflow-hidden border-none p-1">
            <div className="bg-slate-800/50 rounded-[2.3rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
                <div className="space-y-6">
                  <Badge className="bg-blue-500/20 text-blue-400 border-none font-bold rounded-full text-[10px] uppercase tracking-widest px-4 py-1.5">
                    Segurança Enterprise
                  </Badge>
                  <h2 className="text-4xl font-extrabold tracking-tight font-outfit text-white">
                    Controle de Acesso
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed font-medium">
                    Utilize convites individuais criptografados ou restrinja o acesso por domínio
                    corporativo para garantir segurança máxima.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-12 font-bold transition-all shadow-lg shadow-blue-600/20 gap-2">
                          <Globe className="h-4 w-4" />
                          Configurar Domínios
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold font-outfit">
                            Domínios Autorizados
                          </DialogTitle>
                          <DialogDescription className="font-medium">
                            Apenas usuários com e-mails destes domínios poderão ativar o benefício.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="ex: empresa.com"
                              value={newDomain}
                              onChange={(e) => setNewDomain(e.target.value)}
                              className="rounded-xl h-12 border-slate-100 bg-slate-50 focus:bg-white"
                            />
                            <Button
                              onClick={handleAddDomain}
                              className="rounded-xl h-12 bg-slate-900 px-4"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {domains.length > 0 ? (
                              domains.map((domain) => (
                                <div
                                  key={domain}
                                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                                >
                                  <span className="font-bold text-slate-700">{domain}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDomain(domain)}
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-slate-400 text-sm">
                                Nenhum domínio restrito.
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            disabled={isSaving}
                            onClick={handleSaveConfig}
                            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-bold"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Salvar Configurações'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 h-12 font-bold transition-all shadow-lg gap-2">
                          <Lock className="h-4 w-4" />
                          Logs de Segurança
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold font-outfit">
                            Logs de Atividade de Segurança
                          </DialogTitle>
                          <DialogDescription className="font-medium">
                            Histórico de acessos, tentativas e alterações de segurança.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Eye className="h-8 w-8 opacity-30" />
                            <p className="text-sm font-medium">Nenhum log disponível no momento.</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white">Proteção de Vínculo</h4>
                      <p className="text-xs text-slate-500">Garantia de compliance e sigilo</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Convites Únicos', status: 'Ativo' },
                      {
                        label: 'Restrição de Domínio',
                        status: domains.length > 0 ? 'Ativo' : 'Inativo',
                      },
                      { label: 'Login via SSO', status: 'Enterprise' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.status === 'Ativo'
                              ? 'text-blue-500 bg-blue-500/10'
                              : item.status === 'Enterprise'
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-slate-500 bg-slate-500/10'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Company Data */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Building className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold font-outfit">
                    Informações Gerais
                  </CardTitle>
                  <CardDescription className="font-medium">
                    Dados cadastrais da organização para faturamento.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Razão Social</Label>
                  <Input
                    defaultValue={profile?.name || 'Milano Tecnologia'}
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">CNPJ</Label>
                  <Input
                    defaultValue={profile?.cnpj || '12.345.678/0001-90'}
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">E-mail Administrativo</Label>
                  <Input
                    defaultValue={profile?.user?.email || 'rh@empresa.com'}
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Telefone para Contato</Label>
                  <Input
                    defaultValue="(11) 99999-9999"
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/30 p-8 border-t border-slate-50 flex justify-end">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-8 h-12 font-bold shadow-lg shadow-slate-900/10">
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Benefit Rules Sidebar */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pt-8 pb-8">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-bold">Regras do Benefício</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Sessões Mensais</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 rounded-lg px-2 py-1 font-bold"
                  >
                    {profile?.benefitConfig?.sessionsPerMonth || 4} sessões/colab
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Custos p/ Empresa</span>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-600 rounded-lg px-2 py-1 font-bold"
                  >
                    Subsídio 100%
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200 text-slate-600 h-12 font-bold hover:bg-slate-50 mt-4"
              >
                Alterar Regras
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-100 shadow-sm p-6 bg-slate-50 border-dashed border-2">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> Uso de Seats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>{profile?._count?.members || 0} de 50 seats usados</span>
                <span>{Math.round(((profile?._count?.members || 0) / 50) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${Math.round(((profile?._count?.members || 0) / 50) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Sua fatura será ajustada automaticamente ao atingir 50 colaboradores.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
