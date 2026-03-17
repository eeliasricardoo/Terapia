'use client'

import React from 'react'
import {
  CoreHeartIcon,
  CoreVideoIcon,
  CoreShieldIcon,
  CoreUsersIcon,
  CoreClockIcon,
} from '@/components/ui/exclusive-icons'
import { motion, Variants } from 'framer-motion'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

export function ProfessionalsFeatures() {
  const features = [
    {
      title: 'Plataforma Completa',
      description:
        'Gestão de agenda, prontuários eletrônicos e faturamento em um único dashboard intuitivo.',
      icon: <CoreShieldIcon className="h-10 w-10 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      title: 'Atendimento Online',
      description:
        'Sala de vídeo própria com criptografia de ponta a ponta, sem necessidade de softwares externos.',
      icon: <CoreVideoIcon className="h-10 w-10 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'Remuneração Justa',
      description:
        'Processo de repasse transparente e rápido. Defina seus horários e receba por cada sessão realizada.',
      icon: <CoreClockIcon className="h-10 w-10 text-violet-600" />,
      bg: 'bg-violet-50',
    },
  ]

  return (
    <section className="w-full py-20 md:py-40 bg-white relative overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl font-outfit">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Sua clínica, agora digital e escalável
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
            Focamos na tecnologia para que você possa focar no que mais importa: o cuidado com seus
            pacientes.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div
                className={`h-20 w-20 rounded-[2rem] ${feature.bg} flex items-center justify-center mb-8 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
