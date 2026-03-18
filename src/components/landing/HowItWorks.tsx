'use client'

import { motion, Variants } from 'framer-motion'
import { Search, CalendarDays, Video, Heart } from 'lucide-react'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } },
}

const steps = [
  {
    icon: Search,
    title: 'Busque',
    description: 'Encontre o profissional ideal por especialidade, abordagem ou afinidade.',
    accent: 'bg-blue-500',
    lightAccent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: CalendarDays,
    title: 'Agende',
    description: 'Escolha o melhor dia e horário diretamente na agenda do psicólogo.',
    accent: 'bg-indigo-500',
    lightAccent: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Video,
    title: 'Conecte-se',
    description: 'Entre na sessão online com vídeo de alta qualidade, direto do navegador.',
    accent: 'bg-violet-500',
    lightAccent: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Heart,
    title: 'Evolua',
    description: 'Acompanhe seu progresso e construa uma jornada de autoconhecimento.',
    accent: 'bg-rose-500',
    lightAccent: 'bg-rose-50 text-rose-600',
  },
]

export function HowItWorks() {
  return (
    <section className="w-full py-32 md:py-40 bg-white relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-16 right-[12%] w-2 h-2 rounded-full bg-violet-200/60" />
      <div className="absolute bottom-24 left-[8%] w-3 h-3 rounded-full bg-blue-200/40" />

      <div className="container px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-20"
        >
          {/* Section header */}
          <div className="text-center space-y-5">
            <motion.p
              variants={fadeIn}
              className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]"
            >
              Simples e rápido
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-outfit"
            >
              Como funciona?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed"
            >
              Em poucos passos você já estará cuidando de si.
            </motion.p>
          </div>

          {/* Steps */}
          <motion.div variants={stagger} className="relative">
            {/* Connection line */}
            <div
              className="absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent hidden md:block"
              aria-hidden="true"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="flex flex-col items-center text-center gap-5 group"
                >
                  {/* Step number + icon */}
                  <div className="relative">
                    <div
                      className={`h-[104px] w-[104px] rounded-[2rem] ${step.lightAccent} flex items-center justify-center group-hover:scale-110 transition-all duration-500 border border-slate-100`}
                    >
                      <step.icon className="h-8 w-8" />
                    </div>
                    {/* Step number badge */}
                    <div
                      className={`absolute -top-2 -right-2 h-7 w-7 rounded-full ${step.accent} text-white text-xs font-bold flex items-center justify-center shadow-lg`}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
