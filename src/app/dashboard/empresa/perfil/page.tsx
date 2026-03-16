'use client'

import React, { useState } from 'react'
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
import { Building2, ShieldCheck, Users, Calendar, Building } from 'lucide-react'

export default function CompanyProfilePage() {
  const [copied, setCopied] = useState(false)

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
                    <Button className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 h-12 font-bold transition-all shadow-lg shadow-blue-600/20">
                      Configurar Domínios
                    </Button>
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 h-12 font-bold transition-all shadow-lg">
                      Ver Logs de Segurança
                    </Button>
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
                      { label: 'Restrição de Domínio', status: 'Inativo' },
                      { label: 'Login via SSO', status: 'Enterprise' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
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
                    defaultValue="Milano Tecnologia & Inovação"
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">CNPJ</Label>
                  <Input
                    defaultValue="12.345.678/0001-90"
                    className="rounded-xl h-12 border-slate-100 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">E-mail Administrativo</Label>
                  <Input
                    defaultValue="rh@milano.com.br"
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
                    4 sessões/colab
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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Dependentes</span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-50 text-slate-400 rounded-lg px-2 py-1 font-bold"
                  >
                    Desativado
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
                <span>42 de 50 seats usados</span>
                <span>84%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[84%]" />
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
