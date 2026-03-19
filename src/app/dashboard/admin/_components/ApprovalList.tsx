'use client'

import { useState } from 'react'
import { verifyPsychologist, rejectPsychologist } from '@/lib/actions/admin'
import {
  Check,
  X,
  ShieldAlert,
  FileText,
  CalendarDays,
  ShieldCheck,
  DollarSign,
  Briefcase,
  GraduationCap,
  Quote,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type PendingPsychologist = {
  id: string
  userId: string
  fullName: string
  email: string
  crp: string | null
  specialties: string[]
  bio?: string | null
  pricePerSession?: number
  yearsOfExperience?: number | null
  university?: string | null
  academicLevel?: string | null
  diplomaUrl?: string | null
  licenseUrl?: string | null
  createdAt: string
  avatarUrl?: string | null
}

export function ApprovalList({ initialPending }: { initialPending: PendingPsychologist[] }) {
  const [pending, setPending] = useState(initialPending)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedPsicologo, setSelectedPsicologo] = useState<PendingPsychologist | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string, name: string) => {
    setLoadingId(id)
    const result = await verifyPsychologist(id)

    if (result.success) {
      toast.success(`Psicólogo ${name} aprovado com sucesso!`)
      setPending((prev) => prev.filter((p) => p.id !== id))
      setIsSheetOpen(false)
    } else {
      toast.error(result.error || 'Ocorreu um erro ao aprovar.')
    }
    setLoadingId(null)
  }

  const handleReject = async (id: string, name: string) => {
    if (!rejectReason.trim()) {
      toast.error('Informe um motivo para a rejeição.')
      return
    }

    setLoadingId(id)
    const result = await rejectPsychologist(id, rejectReason)

    if (result.success) {
      toast.success(`Cadastro de ${name} rejeitado.`)
      setPending((prev) => prev.filter((p) => p.id !== id))
      setRejectReason('')
    } else {
      toast.error(result.error || 'Ocorreu um erro ao rejeitar.')
    }
    setLoadingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pending.map((p) => (
        <div
          key={p.id}
          className="group relative border border-slate-200 rounded-3xl p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-4 ring-slate-50">
                <AvatarImage src={p.avatarUrl || undefined} />
                <AvatarFallback className="bg-slate-50 text-slate-400 font-bold">
                  {p.fullName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{p.fullName}</h3>
                <p className="text-sm text-slate-500 font-medium">{p.email}</p>
              </div>
            </div>
            <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[10px] tracking-widest px-2 py-0.5">
              AGUARDANDO
            </Badge>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-300" /> CRP
              </span>
              <span className="font-bold text-slate-900">{p.crp || 'Não informado'}</span>
            </div>
            {p.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {p.specialties.slice(0, 2).map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="bg-slate-50/50 border-slate-100 text-slate-500 font-medium text-[11px]"
                  >
                    {s}
                  </Badge>
                ))}
                {p.specialties.length > 2 && (
                  <span className="text-[11px] text-slate-400 font-bold ml-1">
                    +{p.specialties.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              setSelectedPsicologo(p)
              setIsSheetOpen(true)
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl h-12 transition-all group-hover:shadow-lg"
          >
            Analisar Perfil Completo
          </Button>
        </div>
      ))}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-2xl p-0 border-none shadow-2xl">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-8 pb-60">
              <SheetHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-sm">
                      <AvatarImage src={selectedPsicologo?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-xl">
                        {selectedPsicologo?.fullName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-2xl font-bold text-slate-900">
                        {selectedPsicologo?.fullName}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-medium text-base">
                        {selectedPsicologo?.email}
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
                <InfoItem icon={ShieldCheck} label="Registro CRP" value={selectedPsicologo?.crp} />
                <InfoItem
                  icon={DollarSign}
                  label="Valor da Sessão"
                  value={`R$ ${selectedPsicologo?.pricePerSession || 0}`}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Tempo de Experiência"
                  value={`${selectedPsicologo?.yearsOfExperience || 0} anos`}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Formação"
                  value={`${selectedPsicologo?.academicLevel || 'Graduado'} em ${selectedPsicologo?.university || 'Não informado'}`}
                />
              </div>

              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl ring-1 ring-slate-200/50">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Quote className="h-4 w-4 text-slate-400" />
                  <h4>Bio e Apresentação</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedPsicologo?.bio || 'Nenhuma biografia informada.'}
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
                    disabled={!selectedPsicologo?.diplomaUrl}
                    onClick={() => window.open(selectedPsicologo?.diplomaUrl!, '_blank')}
                  >
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 leading-none">Diploma</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                        {selectedPsicologo?.diplomaUrl ? 'Visualizar Arquivo' : 'Não enviado'}
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-14 border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                    disabled={!selectedPsicologo?.licenseUrl}
                    onClick={() => window.open(selectedPsicologo?.licenseUrl!, '_blank')}
                  >
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 leading-none">
                        Registro Profissional
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                        {selectedPsicologo?.licenseUrl ? 'Visualizar Arquivo' : 'Não enviado'}
                      </p>
                    </div>
                  </Button>
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
                    Atenção: Ao rejeitar, o psicólogo voltará para o status de &apos;Paciente&apos;
                    e precisará recriar o perfil profissional.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <SheetFooter className="flex justify-end gap-3">
              <Button
                onClick={() => handleApprove(selectedPsicologo?.id!, selectedPsicologo?.fullName!)}
                disabled={loadingId === selectedPsicologo?.id}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-100 order-first"
              >
                {loadingId === selectedPsicologo?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Aprovar Profissional'
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 font-bold rounded-xl px-4"
                disabled={loadingId === selectedPsicologo?.id || !rejectReason.trim()}
                onClick={() => handleReject(selectedPsicologo?.id!, selectedPsicologo?.fullName!)}
              >
                {loadingId === selectedPsicologo?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reprovar'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
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

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl ring-1 ring-slate-100">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value || '---'}</p>
      </div>
    </div>
  )
}
