'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { SPECIALTIES, APPROACHES } from './constants'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Video,
  ShieldCheck,
  UploadCloud,
  ShieldAlert,
  Search,
  FileCheck,
  Camera,
  ScanFace,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { savePsychologistProfile } from '@/lib/actions/onboarding'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function PsychologistOnboardingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const router = useRouter()
  const { fullName } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload Simulation States
  const [docUploadStatus, setDocUploadStatus] = useState<'idle' | 'analyzing' | 'success'>('idle')
  const [fakeDocFile, setFakeDocFile] = useState<string | null>(null)

  const [selfieUploadStatus, setSelfieUploadStatus] = useState<'idle' | 'analyzing' | 'success'>(
    'idle'
  )
  const [fakeSelfieFile, setFakeSelfieFile] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    crp: '',
    fullName: fullName || '',
    acceptTerms: false,
    specialties: [] as string[],
    approaches: [] as string[],
    bio: '',
    price: '',
    videoUrl: '',
  })

  const docInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleItem = (field: 'specialties' | 'approaches', value: string) => {
    setFormData((prev) => {
      const current = prev[field]
      const exists = current.includes(value)

      if (exists) {
        return { ...prev, [field]: current.filter((item) => item !== value) }
      } else {
        if (field === 'specialties' && current.length >= 5) return prev
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFakeDocFile(file.name)
      setDocUploadStatus('analyzing')

      setTimeout(() => {
        setDocUploadStatus('success')
        toast.success('Documento processado!', {
          description: 'A inteligência artificial validou os dados do seu CRP.',
        })
      }, 2500)
    }
  }

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFakeSelfieFile(file.name)
      setSelfieUploadStatus('analyzing')

      setTimeout(() => {
        setSelfieUploadStatus('success')
        toast.success('Reconhecimento facial concluído!', {
          description: 'Liveness check finalizado com sucesso.',
        })
      }, 3000)
    }
  }

  const nextStep = () => {
    if (step < 6) {
      setDirection(1)
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const result = await savePsychologistProfile({
        fullName: formData.fullName,
        crp: formData.crp,
        specialties: formData.specialties,
        approaches: formData.approaches,
        bio: formData.bio,
        price: parseFloat(formData.price),
        videoUrl: formData.videoUrl,
      })

      if (result.success) {
        toast.success('Perfil enviado para curadoria!', {
          description: 'Nosso time validará seus documentos junto de seu CRP em até 24h.',
        })
        router.push('/dashboard')
      } else {
        toast.error('Erro ao criar perfil', {
          description: result.error || 'Tente novamente.',
        })
      }
    } catch (error) {
      logger.error('Error submitting psychologist onboarding:', error)
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao salvar seus dados.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    }),
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Vamos começar pelo básico'
      case 2:
        return 'Validação Antifraude (KYC)'
      case 3:
        return 'Suas especialidades'
      case 4:
        return 'Sua abordagem'
      case 5:
        return 'Sua apresentação'
      case 6:
        return 'Finalizando seu perfil'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Qual o seu nome profissional e número de registro?'
      case 2:
        return 'Precisamos garantir a segurança dos pacientes. Uma selfie e foto do documento são obrigatórias.'
      case 3:
        return 'Selecione até 5 áreas que você tem maior experiência.'
      case 4:
        return 'Como você conduz suas sessões? Isso ajuda no match com o paciente.'
      case 5:
        return 'Crie uma bio atrativa e humanizada para seu perfil.'
      case 6:
        return 'Defina seus valores e junte-se à nossa comunidade.'
      default:
        return ''
    }
  }

  const isStepValid = () => {
    if (step === 1) return formData.fullName.length > 2 && formData.crp.length > 4
    if (step === 2)
      return (
        docUploadStatus === 'success' && selfieUploadStatus === 'success' && formData.acceptTerms
      )
    if (step === 3) return formData.specialties.length > 0
    if (step === 4) return formData.approaches.length > 0
    if (step === 5) return formData.bio.length >= 10
    if (step === 6) return !!formData.price
    return false
  }

  return (
    <Card className="mx-auto max-w-2xl w-full border-0 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl ring-1 ring-slate-100/50">
      <CardHeader className="text-center pb-2 pt-10">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex-1 mr-6">
            <Progress
              value={(step / 6) * 100}
              className="h-2 transition-all duration-700 bg-slate-100 [&>div]:bg-blue-600 rounded-full"
            />
          </div>
          <span className="text-[10px] font-black text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-full uppercase tracking-tighter ring-1 ring-blue-500/10">
            Passo {step}/6
          </span>
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-base mt-3 text-slate-500 font-medium max-w-[400px] mx-auto leading-relaxed">
          {getStepDescription()}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-6">
        <div className="min-h-[380px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* STEP 1: Básico */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-sm font-bold text-slate-700">
                        Nome Profissional Completo
                      </Label>
                      <Input
                        id="fullname"
                        placeholder="Ex: Dra. Ana Silva"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="h-14 text-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-2xl shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crp" className="text-sm font-bold text-slate-700">
                        Registro CRP Ativo
                      </Label>
                      <Input
                        id="crp"
                        placeholder="Ex: 06/12345"
                        value={formData.crp}
                        onChange={(e) => updateField('crp', e.target.value)}
                        className="h-14 text-lg font-mono tracking-widest border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-2xl shadow-sm"
                      />
                    </div>

                    <div className="flex bg-blue-50/50 p-4 rounded-2xl items-start gap-3 border border-blue-100/50">
                      <Lock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
                        Estas informações são confidenciais e usadas exclusivamente para a criação
                        do seu perfil na plataforma caso aprovado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Validação */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl flex gap-3 text-amber-800 shadow-sm">
                    <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500" />
                    <div className="text-sm">
                      <p className="font-bold mb-1">Processo de Segurança Rigoroso</p>
                      <p className="opacity-90 leading-relaxed text-xs">
                        Nossa plataforma cruza dados em tempo real com entidades públicas para
                        bloquear cadastros fraudulentos. Siga os passos abaixo com atenção.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document Upload */}
                    <div
                      onClick={() => docUploadStatus === 'idle' && docInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden flex flex-col justify-center h-[200px]',
                        docUploadStatus === 'idle'
                          ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                          : docUploadStatus === 'analyzing'
                            ? 'border-blue-400 bg-blue-50/50'
                            : 'border-emerald-500 bg-emerald-50'
                      )}
                    >
                      <input
                        type="file"
                        ref={docInputRef}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleDocUpload}
                        disabled={docUploadStatus !== 'idle'}
                      />

                      {docUploadStatus === 'idle' && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UploadCloud className="h-8 w-8 text-blue-600 mb-2" />
                          <p className="font-bold text-slate-700 text-sm">Foto do CRP</p>
                          <p className="text-[10px] text-slate-500">Versão física ou e-CIP</p>
                        </div>
                      )}

                      {docUploadStatus === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Search className="h-6 w-6 text-blue-600 animate-pulse" />
                          <p className="font-bold text-slate-800 text-sm">Analisando CRP...</p>
                        </div>
                      )}

                      {docUploadStatus === 'success' && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                          <p className="font-bold text-emerald-700 text-sm">Doc Validado</p>
                        </div>
                      )}
                    </div>

                    {/* Selfie Upload */}
                    <div
                      onClick={() =>
                        selfieUploadStatus === 'idle' && selfieInputRef.current?.click()
                      }
                      className={cn(
                        'border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden flex flex-col justify-center h-[200px]',
                        selfieUploadStatus === 'idle'
                          ? 'border-slate-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                          : selfieUploadStatus === 'analyzing'
                            ? 'border-purple-400 bg-purple-50/50'
                            : 'border-emerald-500 bg-emerald-50'
                      )}
                    >
                      <input
                        type="file"
                        ref={selfieInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieUpload}
                        disabled={selfieUploadStatus !== 'idle'}
                      />

                      {selfieUploadStatus === 'idle' && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Camera className="h-8 w-8 text-purple-600 mb-2" />
                          <p className="font-bold text-slate-700 text-sm">Selfie em Tempo Real</p>
                          <p className="text-[10px] text-slate-500">Rosto bem iluminado</p>
                        </div>
                      )}

                      {selfieUploadStatus === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center gap-3">
                          <ScanFace className="h-8 w-8 text-purple-600 animate-pulse" />
                          <p className="font-bold text-slate-800 text-sm">Liveness Check...</p>
                        </div>
                      )}

                      {selfieUploadStatus === 'success' && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                          <p className="font-bold text-emerald-700 text-sm">Rosto Validado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-4 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateField('acceptTerms', e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
                    >
                      Atesto que as informações são verídicas. Estou ciente de que{' '}
                      <strong>
                        uso de dados falsos ou se passar por outro profissional constitui crime de
                        falsidade ideológica (Art. 299).
                      </strong>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: Especialidades */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {SPECIALTIES.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => toggleItem('specialties', spec.label)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300 group',
                          formData.specialties.includes(spec.label)
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[0.98]'
                            : 'border-slate-100 bg-white hover:border-blue-300 hover:shadow-md'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-lg transition-all',
                            formData.specialties.includes(spec.label)
                              ? 'bg-white/20'
                              : 'bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600'
                          )}
                        >
                          <spec.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{spec.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-xs font-bold',
                        formData.specialties.length === 5 ? 'text-amber-500' : 'text-slate-400'
                      )}
                    >
                      Selecionadas: {formData.specialties.length} / 5
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Abordagem */}
              {step === 4 && (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {APPROACHES.map((approach) => (
                    <button
                      key={approach.id}
                      onClick={() => toggleItem('approaches', approach.label)}
                      className={cn(
                        'flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all w-full relative group',
                        formData.approaches.includes(approach.label)
                          ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-600/10'
                          : 'border-slate-100 bg-white hover:border-blue-200'
                      )}
                    >
                      <div className="flex justify-between w-full mb-2">
                        <span className="font-bold text-lg text-slate-900 tracking-tight">
                          {approach.label}
                        </span>
                        {formData.approaches.includes(approach.label) && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-sm text-slate-500 font-medium leading-relaxed pr-8 line-clamp-2">
                        {approach.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 5: Bio e Video */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-bold text-slate-700">
                      Sua Carta de Apresentação
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre sua trajetória clínica, valores e como você conduz o processo terapêutico..."
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="min-h-[180px] text-base leading-relaxed resize-none p-5 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <div className="flex justify-between items-center px-2 pt-1">
                      <span className="text-[10px] uppercase font-black text-slate-400">
                        Humanize seu perfil
                      </span>
                      <span
                        className={cn(
                          'text-xs font-bold transition-colors',
                          formData.bio.length < 50 ? 'text-amber-500' : 'text-blue-600'
                        )}
                      >
                        {formData.bio.length} chars
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label
                      htmlFor="video"
                      className="text-sm font-bold text-slate-700 flex items-center gap-2"
                    >
                      <Video className="h-4 w-4 text-blue-500" /> Pitch de Vídeo (Opcional)
                    </Label>
                    <Input
                      id="video"
                      placeholder="Cole aqui o link do Youtube / Vimeo"
                      value={formData.videoUrl}
                      onChange={(e) => updateField('videoUrl', e.target.value)}
                      className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Preço */}
              {step === 6 && (
                <div className="space-y-10 py-5">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                      className="h-24 w-24 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm ring-1 ring-emerald-200"
                    >
                      <Sparkles className="h-12 w-12 animate-pulse" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight pt-2">
                      Etapa Final!
                    </h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                      Qual é o seu honorário para a sessão padrão de 50 minutos?
                    </p>
                  </div>

                  <div className="max-w-[280px] mx-auto space-y-5">
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl group-focus-within:text-blue-600 transition-colors">
                        R$
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0,00"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        className="h-24 pl-16 pr-6 text-4xl font-black text-center border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-[2rem] transition-all bg-white shadow-sm"
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50/80 p-5 rounded-3xl flex flex-col items-center border border-blue-100/50 shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Proteção Financeira
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-bold text-center">
                        Você receberá{' '}
                        <span className="text-emerald-600 font-black bg-emerald-100/50 px-2 py-0.5 rounded-lg">
                          R${' '}
                          {formData.price ? (parseFloat(formData.price) * 0.85).toFixed(2) : '0,00'}
                        </span>{' '}
                        líquidos por sessão de 50 min.
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="px-8 pb-8 pt-4 bg-slate-50/50 border-t border-slate-100/50">
        <div className="flex justify-between items-center w-full">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={
              step === 1 || docUploadStatus === 'analyzing' || selfieUploadStatus === 'analyzing'
            }
            className="text-slate-500 font-bold hover:bg-slate-200/50 hover:text-slate-800 rounded-2xl px-6 h-12 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Button
            onClick={nextStep}
            className={cn(
              'px-8 h-14 text-sm font-black shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.03] active:scale-[0.97]',
              step === 6
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 text-white ring-2 ring-emerald-600/20 ring-offset-2'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 text-white'
            )}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Validando...
              </span>
            ) : step === 6 ? (
              <span className="flex items-center gap-2">
                Enviar para Análise <CheckCircle2 className="h-5 w-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
