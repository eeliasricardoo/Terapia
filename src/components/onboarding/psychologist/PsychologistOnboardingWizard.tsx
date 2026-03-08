'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { SPECIALTIES, APPROACHES } from './constants'
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Video, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { savePsychologistProfile } from '@/lib/actions/onboarding'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function PsychologistOnboardingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const router = useRouter()
  const { user, fullName } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    crp: '',
    fullName: fullName || '',
    specialties: [] as string[],
    approaches: [] as string[],
    bio: '',
    price: '',
    videoUrl: '',
    availability: {
      days: [] as string[],
      start: '08:00',
      end: '18:00',
    },
  })

  // Helper to update simple fields
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Helper to toggle array items
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

  const nextStep = () => {
    if (step < 5) {
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
        toast.success('Perfil criado com sucesso!', {
          description: 'Redirecionando para seu painel...',
        })
        router.push('/dashboard')
      } else {
        toast.error('Erro ao criar perfil', {
          description: result.error || 'Tente novamente mais tarde.',
        })
      }
    } catch (error) {
      console.error(error)
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
        return 'Suas especialidades'
      case 3:
        return 'Sua abordagem'
      case 4:
        return 'Sua apresentação'
      case 5:
        return 'Finalizando seu perfil'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Precisamos validar suas credenciais para garantir a segurança dos pacientes.'
      case 2:
        return 'Selecione até 5 áreas que você tem maior experiência.'
      case 3:
        return 'Como você conduz suas sessões? Isso ajuda no match com o paciente.'
      case 4:
        return 'Crie uma bio atrativa e humanizada para seu perfil.'
      case 5:
        return 'Defina seus valores e comece a transformar vidas.'
      default:
        return ''
    }
  }

  return (
    <Card className="mx-auto max-w-2xl w-full border-none shadow-2xl overflow-hidden bg-white/90 backdrop-blur-md">
      <CardHeader className="text-center pb-2 pt-10">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex-1 mr-6">
            <Progress value={(step / 5) * 100} className="h-1.5 transition-all duration-700" />
          </div>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
            Passo {step}/5
          </span>
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-lg mt-2 text-slate-500 font-medium max-w-md mx-auto">
          {getStepDescription()}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        <div className="min-h-[350px]">
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
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-sm font-bold text-slate-700">
                        Nome Profissional
                      </Label>
                      <Input
                        id="fullname"
                        placeholder="Ex: Dra. Ana Silva"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="h-14 text-lg border-slate-100 bg-slate-50/50 focus:bg-white transition-all rounded-2xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crp" className="text-sm font-bold text-slate-700">
                        Registro CRP
                      </Label>
                      <Input
                        id="crp"
                        placeholder="Ex: 06/12345"
                        value={formData.crp}
                        onChange={(e) => updateField('crp', e.target.value)}
                        className="h-14 text-lg font-mono tracking-widest border-slate-100 bg-slate-50/50 focus:bg-white transition-all rounded-2xl"
                      />
                      <div className="flex gap-2 items-center text-xs text-blue-500 font-bold mt-1 bg-blue-50/50 w-fit px-2 py-1 rounded-lg">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verificamos seu CRP junto ao conselho
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {SPECIALTIES.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => toggleItem('specialties', spec.label)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all group',
                          formData.specialties.includes(spec.label)
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'border-slate-100 bg-white hover:border-blue-200'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-xl transition-all',
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
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  {APPROACHES.map((approach) => (
                    <button
                      key={approach.id}
                      onClick={() => toggleItem('approaches', approach.label)}
                      className={cn(
                        'flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all w-full relative group',
                        formData.approaches.includes(approach.label)
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-50 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div className="flex justify-between w-full mb-1">
                        <span className="font-bold text-lg text-slate-900 tracking-tight">
                          {approach.label}
                        </span>
                        {formData.approaches.includes(approach.label) && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm text-slate-500 font-medium leading-snug pr-8">
                        {approach.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-bold text-slate-700">
                      Sua Bio Profissional
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte sua trajetória, valores e como você ajuda seus pacientes..."
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="min-h-[200px] text-base leading-relaxed resize-none p-5 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white shadow-inner"
                    />
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] uppercase font-black text-slate-400">
                        Seja autêntico e acolhedor
                      </span>
                      <span
                        className={cn(
                          'text-xs font-bold',
                          formData.bio.length < 50 ? 'text-amber-500' : 'text-blue-600'
                        )}
                      >
                        {formData.bio.length}/500
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label
                      htmlFor="video"
                      className="text-sm font-bold text-slate-700 flex items-center gap-2"
                    >
                      <Video className="h-4 w-4 text-blue-500" /> Vídeo de Apresentação (Opcional)
                    </Label>
                    <Input
                      id="video"
                      placeholder="Link do seu vídeo (Youtube ou Vimeo)"
                      value={formData.videoUrl}
                      onChange={(e) => updateField('videoUrl', e.target.value)}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-10 py-4">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Sparkles className="h-10 w-10 animate-pulse" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quase lá!</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                      Sua jornada começa agora. Defina o valor do seu investimento por sessão.
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl group-focus-within:text-blue-600 transition-colors">
                        R$
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0,00"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        className="h-20 pl-14 text-3xl font-black text-center border-2 border-slate-100 focus:border-blue-600 rounded-[2rem] transition-all"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 items-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Repasse da plataforma
                      </p>
                      <p className="text-sm text-slate-600 font-bold">
                        Sua sessão de 50min renderá R${' '}
                        {formData.price ? (parseFloat(formData.price) * 0.85).toFixed(2) : '0,00'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className="text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 rounded-2xl px-6 h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Button
            onClick={nextStep}
            className={cn(
              'px-10 h-14 text-base font-black shadow-xl transition-all rounded-2xl hover:scale-[1.02] active:scale-[0.98]',
              step === 5
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'
            )}
            disabled={
              isSubmitting ||
              (step === 1 && (!formData.fullName || !formData.crp)) ||
              (step === 2 && formData.specialties.length === 0) ||
              (step === 3 && formData.approaches.length === 0) ||
              (step === 4 && formData.bio.length < 10) ||
              (step === 5 && !formData.price)
            }
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Finalizando...
              </span>
            ) : step === 5 ? (
              <span className="flex items-center gap-2">
                Concluir Perfil <CheckCircle2 className="h-5 w-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
