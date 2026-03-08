'use client'

import { useState } from 'react'
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
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Heart,
  Users,
  Briefcase,
  User,
  Zap,
  Coffee,
  Frown,
  Home,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Clock,
  Pill,
  Stethoscope,
  Smile,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { savePatientPreferences } from '@/lib/actions/professional-onboarding'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const focusAreas = [
  { name: 'Ansiedade', icon: Zap },
  { name: 'Depressão', icon: Frown },
  { name: 'Relacionamentos', icon: Users },
  { name: 'Carreira', icon: Briefcase },
  { name: 'Autoestima', icon: Heart },
  { name: 'Estresse', icon: Brain },
  { name: 'Luto', icon: Coffee },
  { name: 'Família', icon: Home },
  { name: 'Sexualidade', icon: Smile },
  { name: 'Casais', icon: Users },
]

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  const [preferences, setPreferences] = useState({
    gender: '',
    age: '',
    style: '',
  })
  const [availability, setAvailability] = useState({
    days: [] as string[],
    times: [] as string[],
  })
  const [history, setHistory] = useState({
    previousTherapy: '',
    medication: '',
    bio: '',
  })

  const router = useRouter()

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const updatePreference = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  const toggleTime = (time: string) => {
    setAvailability((prev) => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time],
    }))
  }

  const updateHistory = (key: keyof typeof history, value: string) => {
    setHistory((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = async () => {
    if (step < 4) {
      setDirection(1)
      setStep(step + 1)
    } else {
      setIsSubmitting(true)
      try {
        const result = await savePatientPreferences({
          selectedAreas,
          preferences,
          availability,
          history,
        })

        if (!result.success) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }

        toast.success('Mapeamento concluído com sucesso!', {
          description: 'Direcionando você para as melhores escolhas.',
        })
        router.push('/busca')
      } catch (error) {
        toast.error('Ocorreu um erro inesperado ao salvar.')
        setIsSubmitting(false)
      }
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'O que traz você aqui?'
      case 2:
        return 'O especialista ideal'
      case 3:
        return 'Sua disponibilidade'
      case 4:
        return 'Seu histórico clínico'
      default:
        return 'Passo ' + step
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Selecione os temas que deseja trabalhar. Não se preocupe, ajudaremos a encontrar o match perfeito.'
      case 2:
        return 'Suas preferências ajudam a tornar a conexão inicial muito mais natural e acolhedora.'
      case 3:
        return 'Escolha os melhores horários para suas sessões semanais.'
      case 4:
        return 'Informações médicas essenciais (protegidas por sigilo) que ajudam o profissional a se preparar.'
      default:
        return ''
    }
  }

  const isStepValid = () => {
    if (step === 1) return selectedAreas.length > 0
    if (step === 2) return true // optional
    if (step === 3) return availability.days.length > 0 && availability.times.length > 0
    if (step === 4) return history.previousTherapy && history.medication
    return false
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

  return (
    <Card className="mx-auto max-w-2xl w-full border-0 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl ring-1 ring-slate-100/50">
      <CardHeader className="text-center pb-2 pt-10">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex-1 mr-6">
            <Progress
              value={(step / 4) * 100}
              className="h-2 transition-all duration-700 bg-slate-100 [&>div]:bg-blue-600 rounded-full"
            />
          </div>
          <span className="text-[10px] font-black text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-full uppercase tracking-tighter ring-1 ring-blue-500/10">
            Passo {step}/4
          </span>
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-base mt-3 text-slate-500 font-medium max-w-[420px] mx-auto leading-relaxed">
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
              {/* STEP 1: Foco */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-3 my-4">
                  {focusAreas.map((area) => {
                    const Icon = area.icon
                    const isSelected = selectedAreas.includes(area.name)
                    return (
                      <button
                        key={area.name}
                        onClick={() => toggleArea(area.name)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 border-2 text-left group',
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[0.98]'
                            : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md text-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-xl transition-colors',
                            isSelected ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-blue-50'
                          )}
                        >
                          <Icon
                            className={cn('h-5 w-5', isSelected ? 'text-white' : 'text-blue-500')}
                          />
                        </div>
                        {area.name}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* STEP 2: Preferências */}
              {step === 2 && (
                <div className="space-y-8 my-4">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" /> Preferência de Gênero
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Feminino', 'Masculino', 'Não-binário', 'Sem preferência'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updatePreference('gender', option)}
                          className={cn(
                            'px-3 py-4 rounded-2xl text-xs font-bold transition-all duration-200 border-2',
                            preferences.gender === option
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" /> Experiência do Profissional
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'jovem', label: 'Mais Jovem', desc: 'Até 10 anos exp.' },
                        { id: 'experiente', label: 'Sênior', desc: '10+ anos exp.' },
                        { id: 'tanto_faz', label: 'Tanto faz', desc: 'Foco na empatia' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => updatePreference('age', option.id)}
                          className={cn(
                            'px-4 py-4 rounded-2xl text-left transition-all duration-200 border-2 flex flex-col',
                            preferences.age === option.id
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-purple-200'
                          )}
                        >
                          <span className="text-sm font-bold">{option.label}</span>
                          <span
                            className={cn(
                              'text-[10px] mt-0.5',
                              preferences.age === option.id ? 'text-white/80' : 'text-slate-400'
                            )}
                          >
                            {option.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-emerald-500" /> Estilo de Atendimento
                    </h3>
                    <div className="flex gap-2">
                      {['Mais Direto', 'Mais Acolhedor', 'Sem preferência'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updatePreference('style', option)}
                          className={cn(
                            'flex-1 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-200 border-2',
                            preferences.style === option
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Disponibilidade */}
              {step === 3 && (
                <div className="space-y-8 my-4">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-500" /> Dias da Semana
                    </h3>
                    <div className="flex justify-between gap-1">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={cn(
                            'flex-1 h-14 rounded-xl text-xs font-black transition-all duration-200 border-2 flex flex-col items-center justify-center gap-1',
                            availability.days.includes(day)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[0.98]'
                              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500'
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" /> Períodos de Preferência
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Manhã', icon: Zap, label: '08h ~ 12h' },
                        { name: 'Tarde', icon: Coffee, label: '12h ~ 18h' },
                        { name: 'Noite', icon: Brain, label: '18h ~ 22h' },
                      ].map((time) => (
                        <button
                          key={time.name}
                          onClick={() => toggleTime(time.name)}
                          className={cn(
                            'px-4 py-6 rounded-3xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-3',
                            availability.times.includes(time.name)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[0.98]'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-500 hover:bg-slate-50'
                          )}
                        >
                          <time.icon
                            className={cn(
                              'h-6 w-6',
                              availability.times.includes(time.name) ? 'opacity-100' : 'opacity-80'
                            )}
                          />
                          {time.name}
                          <span
                            className={cn(
                              'text-[10px] font-medium border px-2 py-0.5 rounded-full',
                              availability.times.includes(time.name)
                                ? 'border-white/30'
                                : 'border-slate-200'
                            )}
                          >
                            {time.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Histórico */}
              {step === 4 && (
                <div className="space-y-8 my-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" /> Já fez terapia antes?
                      </h3>
                      <div className="flex gap-2">
                        {['Sim', 'Não'].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateHistory('previousTherapy', option)}
                            className={cn(
                              'flex-1 px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2',
                              history.previousTherapy === option
                                ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-purple-200'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Pill className="h-4 w-4 text-emerald-500" /> Usa medicação contínua?
                      </h3>
                      <div className="flex gap-2">
                        {['Sim', 'Não'].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateHistory('medication', option)}
                            className={cn(
                              'flex-1 px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2',
                              history.medication === option
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800">Observações adicionais (opcional)</h3>
                    <Textarea
                      placeholder="Conte um pouquinho sobre o que espera da terapia, sintomas recentes, etc..."
                      className="min-h-[100px] rounded-2xl border-2 border-slate-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm transition-all p-4 resize-none bg-slate-50/50 focus:bg-white"
                      value={history.bio}
                      onChange={(e) => updateHistory('bio', e.target.value)}
                    />
                  </div>

                  <div className="bg-emerald-50/80 p-5 rounded-2xl flex gap-3 items-start border border-emerald-100 shadow-inner">
                    <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      Informações protegidas por sigilo médico, sendo criptografadas ponta-a-ponta e
                      acessíveis <strong>exclusivamente</strong> pelo profissional de saúde da sua
                      escolha.
                    </p>
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
            disabled={step === 1}
            className="text-slate-500 font-bold hover:bg-slate-200/50 hover:text-slate-800 rounded-2xl px-6 h-12 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Button
            onClick={nextStep}
            disabled={!isStepValid() || isSubmitting}
            className={cn(
              'px-8 h-14 text-sm font-black shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.03] active:scale-[0.97]',
              step === 4
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 text-white ring-2 ring-emerald-600/20 ring-offset-2'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 text-white'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Finalizando...
              </span>
            ) : step === 4 ? (
              <span className="flex items-center gap-2">
                Encontrar Psicólogo <CheckCircle2 className="h-5 w-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar mapeamento <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
