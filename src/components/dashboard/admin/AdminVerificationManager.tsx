'use client'

import React, { useState, useEffect } from 'react'
import {
  getPendingPsychologists,
  verifyPsychologist,
  rejectPsychologist,
} from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap,
  Briefcase,
  DollarSign,
  Calendar as CalendarIcon,
  X,
  User,
  Quote,
  FileText,
} from 'lucide-react'

interface PendingPsychologist {
  id: string
  userId: string
  fullName: string
  email: string
  crp: string | null
  specialties: string[]
  bio: string | null
  pricePerSession: number
  yearsOfExperience: number | null
  university: string | null
  academicLevel: string | null
  diplomaUrl: string | null | undefined
  licenseUrl: string | null | undefined
  createdAt: string
  avatarUrl: string | null | undefined
}

export function AdminVerificationManager() {
  const [pending, setPending] = useState<PendingPsychologist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [selectedPsychologist, setSelectedPsychologist] = useState<PendingPsychologist | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    setIsLoading(true)
    try {
      const res = await getPendingPsychologists()
      setPending(res.success ? res.data : [])
    } catch (error) {
      toast.error('Erro ao carregar psicólogos pendentes')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerify(id: string) {
    setVerifyingId(id)
    try {
      const result = await verifyPsychologist({ psychologistId: id })
      if (result.success) {
        toast.success('Psicólogo verificado com sucesso!')
        setPending((prev) => prev.filter((p) => p.id !== id))
        setIsDialogOpen(false)
      } else {
        toast.error(result.error || 'Erro ao verificar psicólogo')
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setVerifyingId(null)
    }
  }

  async function handleReject(id: string, name: string) {
    if (!rejectReason.trim()) {
      toast.error('Informe um motivo para a rejeição.')
      return
    }

    setVerifyingId(id)
    try {
      const result = await rejectPsychologist({ psychologistId: id, reason: rejectReason })
      if (result.success) {
        toast.success(`Cadastro de ${name} rejeitado.`)
        setPending((prev) => prev.filter((p) => p.id !== id))
        setRejectReason('')
        setIsDialogOpen(false)
      } else {
        toast.error(result.error || 'Erro ao rejeitar psicólogo')
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setVerifyingId(null)
    }
  }

  function openReview(p: PendingPsychologist) {
    setSelectedPsychologist(p)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-label="Carregando" />
          <span className="sr-only">Carregando psicólogos pendentes...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Fila de Verificação</CardTitle>
          </div>
          <CardDescription>
            Analise cuidadosamente as informações antes de aprovar novos profissionais na
            plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-slate-500 font-medium">Nenhum cadastro aguardando revisão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-white hover:border-blue-100 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={p.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-lg">
                        {p.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {p.fullName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-400">
                          CRP: <span className="text-slate-700">{p.crp || '---'}</span>
                        </span>
                        <span className="text-slate-200">•</span>
                        <span>{p.email}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.specialties?.slice(0, 3).map((s: string) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px] py-0 px-2 bg-blue-50/50 text-blue-700 border-none font-semibold"
                          >
                            {s}
                          </Badge>
                        ))}
                        {p.specialties?.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium ml-1 self-center">
                            +{p.specialties.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => openReview(p)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    size="sm"
                  >
                    Analisar Perfil
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent side="right" className="sm:max-w-2xl p-0 border-none shadow-2xl">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-8 pb-60">
              <SheetHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-sm">
                      <AvatarImage src={selectedPsychologist?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-xl">
                        {selectedPsychologist?.fullName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-2xl font-bold text-slate-900">
                        {selectedPsychologist?.fullName}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-medium text-base">
                        {selectedPsychologist?.email}
                      </SheetDescription>
                    </div>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1">
                    AGUARDANDO
                  </Badge>
                </div>
              </SheetHeader>

              <Separator className="bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem
                  icon={ShieldCheck}
                  label="Registro CRP"
                  value={selectedPsychologist?.crp}
                  color="slate"
                />
                <InfoItem
                  icon={DollarSign}
                  label="Valor da Sessão"
                  value={`R$ ${selectedPsychologist?.pricePerSession || 0}`}
                  color="slate"
                />
                <InfoItem
                  icon={Briefcase}
                  label="Tempo de Experiência"
                  value={`${selectedPsychologist?.yearsOfExperience || 0} anos`}
                  color="slate"
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Formação"
                  value={`${selectedPsychologist?.academicLevel || 'Graduado'} em ${selectedPsychologist?.university || 'Não informado'}`}
                  color="slate"
                />
              </div>

              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl ring-1 ring-slate-200/50">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Quote className="h-4 w-4 text-slate-400" />
                  <h4>Bio e Apresentação</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedPsychologist?.bio || 'Nenhuma biografia informada.'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest pl-1">
                  Documentação Enviada
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-14 border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                    disabled={!selectedPsychologist?.diplomaUrl}
                    onClick={() =>
                      window.open(selectedPsychologist?.diplomaUrl ?? undefined, '_blank')
                    }
                  >
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 leading-none">Diploma</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                        {selectedPsychologist?.diplomaUrl ? 'Visualizar Arquivo' : 'Não enviado'}
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-14 border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                    disabled={!selectedPsychologist?.licenseUrl}
                    onClick={() =>
                      window.open(selectedPsychologist?.licenseUrl ?? undefined, '_blank')
                    }
                  >
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 leading-none">
                        Registro Profissional
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                        {selectedPsychologist?.licenseUrl ? 'Visualizar Arquivo' : 'Não enviado'}
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest pl-1">
                  Especialidades Selecionadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPsychologist?.specialties?.map((s: string) => (
                    <Badge
                      key={s}
                      className="bg-white border border-slate-200 text-slate-600 font-medium px-3 py-1 hover:bg-slate-50 transition-colors"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Motivo da Rejeição */}
              <div className="space-y-3 pt-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest pl-1">
                  Rejeitar Cadastro
                </h4>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Informe o motivo da rejeição (será enviado por e-mail ao profissional)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px] rounded-xl border-slate-200 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Atenção: Ao rejeitar, o psicólogo voltará para o status de &apos;Paciente&apos;.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <SheetFooter className="flex justify-end gap-3">
              <Button
                onClick={() => selectedPsychologist && handleVerify(selectedPsychologist.id)}
                disabled={verifyingId === selectedPsychologist?.id}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-100 order-first"
              >
                {verifyingId === selectedPsychologist?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Aprovar Profissional'
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 font-bold rounded-xl px-4"
                disabled={verifyingId === selectedPsychologist?.id || !rejectReason.trim()}
                onClick={() =>
                  selectedPsychologist &&
                  handleReject(selectedPsychologist.id, selectedPsychologist.fullName)
                }
              >
                {verifyingId === selectedPsychologist?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reprovar'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600 font-bold px-6"
              >
                Fechar
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
  color: string
}

function InfoItem({ icon: Icon, label, value, color }: InfoItemProps) {
  const colors = {
    slate: 'bg-slate-100 text-slate-500',
    primary: 'bg-primary/5 text-primary',
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'h-10 w-10 rounded-xl flex items-center justify-center',
          colors[color as keyof typeof colors]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-bold">{value || '---'}</p>
      </div>
    </div>
  )
}
