'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { savePatientPreferences } from '@/lib/actions/professional-onboarding'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const focusAreas = [
  { name: 'Ansiedade', icon: Brain },
  { name: 'Depressão', icon: Frown },
  { name: 'Relacionamentos', icon: Users },
  { name: 'Carreira', icon: Briefcase },
  { name: 'Autoestima', icon: Heart },
  { name: 'Estresse', icon: Zap },
  { name: 'Luto', icon: Coffee },
  { name: 'Família', icon: Home },
  { name: 'Sexualidade', icon: User },
  { name: 'Terapia de Casal', icon: Users },
]

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
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

  const router = useRouter()

  const nextStep = async () => {
    if (step < 4) {
      setDirection(1)
      setStep(step + 1)
    } else {
      try {
        const result = await savePatientPreferences({
          selectedAreas,
          preferences,
          availability,
          history,
        })

        if (!result.success) {
          toast.error(result.error)
          return
        }

        toast.success('Preferências salvas com sucesso!')
        router.push('/busca')
      } catch (error) {
        toast.error('Ocorreu um erro ao salvar as preferências.')
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
        return 'Como seria seu especialista ideal?'
      case 3:
        return 'Qual sua disponibilidade?'
      case 4:
        return 'Seu histórico clínico'
      default:
        return 'Passo ' + step
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Selecione as áreas que deseja trabalhar. Isso nos ajuda a encontrar o match perfeito.'
      case 2:
        return 'Suas preferências ajudam a tornar a conexão mais natural.'
      case 3:
        return 'Escolha os melhores horários para suas sessões semanais.'
      case 4:
        return 'Essas informações são protegidas e ajudam o profissional a se preparar.'
      default:
        return ''
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  }

  return (
    <Card className="mx-auto max-w-2xl w-full border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            <Progress value={(step / 4) * 100} className="h-1.5 transition-all duration-500" />
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
            Passo {step}/4
          </span>
        </div>
        <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-lg mt-2 text-slate-500 font-medium">
          {getStepDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 my-4">
                {focusAreas.map((area) => {
                  const Icon = area.icon
                  return (
                    <button
                      key={area.name}
                      onClick={() => toggleArea(area.name)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 border-2 text-left group',
                        selectedAreas.includes(area.name)
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-white border-slate-100 hover:border-primary/50 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-xl transition-colors',
                          selectedAreas.includes(area.name)
                            ? 'bg-white/20'
                            : 'bg-slate-100 group-hover:bg-primary/10'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {area.name}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 my-4">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Preferência de Gênero
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Feminino', 'Masculino', 'Não-binário', 'Tanto faz'].map((option) => (
                      <button
                        key={option}
                        onClick={() => updatePreference('gender', option)}
                        className={cn(
                          'px-3 py-3 rounded-xl text-xs font-bold transition-all border-2',
                          preferences.gender === option
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> Experiência do Profissional
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
                          'px-4 py-3 rounded-xl text-left transition-all border-2 flex flex-col',
                          preferences.age === option.id
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
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
                    <Zap className="h-4 w-4 text-primary" /> Estilo de Atendimento
                  </h3>
                  <div className="flex gap-2">
                    {['Mais Direto', 'Mais Acolhedor', 'Tanto faz'].map((option) => (
                      <button
                        key={option}
                        onClick={() => updatePreference('style', option)}
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2',
                          preferences.style === option
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 my-4">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">Dias da Semana</h3>
                  <div className="flex justify-between gap-1">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={cn(
                          'flex-1 h-14 rounded-xl text-xs font-black transition-all border-2 flex flex-col items-center justify-center gap-1',
                          availability.days.includes(day)
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">Períodos de Preferência</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Manhã', icon: Zap },
                      { name: 'Tarde', icon: Coffee },
                      { name: 'Noite', icon: Brain },
                    ].map((time) => (
                      <button
                        key={time.name}
                        onClick={() => toggleTime(time.name)}
                        className={cn(
                          'px-4 py-8 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-3',
                          availability.times.includes(time.name)
                            ? 'bg-primary border-primary text-white shadow-lg'
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        <time.icon className="h-6 w-6" />
                        {time.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 my-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800">Já fez terapia antes?</h3>
                    <div className="flex gap-2">
                      {['Sim', 'Não'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateHistory('previousTherapy', option)}
                          className={cn(
                            'flex-1 px-4 py-4 rounded-xl text-sm font-bold transition-all border-2',
                            history.previousTherapy === option
                              ? 'bg-primary border-primary text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-500'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800">Usa medicação contínua?</h3>
                    <div className="flex gap-2">
                      {['Sim', 'Não'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateHistory('medication', option)}
                          className={cn(
                            'flex-1 px-4 py-4 rounded-xl text-sm font-bold transition-all border-2',
                            history.medication === option
                              ? 'bg-primary border-primary text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-500'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800">Observações (opcional)</h3>
                  <Textarea
                    placeholder="Conta um pouquinho sobre o que espera da terapia..."
                    className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-primary shadow-inner"
                    value={history.bio}
                    onChange={(e) => updateHistory('bio', e.target.value)}
                  />
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100/50">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                    Sua privacidade é prioridade. Estas informações são criptografadas e serão
                    compartilhadas apenas com o profissional que você escolher para realizar o
                    atendimento.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-50">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className="text-slate-400 font-bold hover:bg-slate-50 rounded-xl px-6"
          >
            Anterior
          </Button>
          <Button
            onClick={nextStep}
            className="px-10 rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {step === 4 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar cadastro
              </>
            ) : (
              <>
                Próximo passo <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
