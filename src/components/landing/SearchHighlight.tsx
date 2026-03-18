'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
}

interface SearchHighlightProps {
  totalPsychologists?: number
}

export function SearchHighlight({ totalPsychologists = 500 }: SearchHighlightProps) {
  const stats = [
    {
      value: `${totalPsychologists}+`,
      label: 'Especialistas verificados',
      description: 'Profissionais acolhedores prontos para te ajudar',
    },
    {
      value: '4.9/5',
      label: 'Avaliação média',
      description: 'Baseada em cuidado real e feedback genuíno',
    },
    {
      value: '24/7',
      label: 'Disponibilidade',
      description: 'Sessões online no seu ritmo e espaço',
    },
  ]

  return (
    <section className="w-full py-32 md:py-40 bg-slate-50 relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:64px_64px] pointer-events-none" />

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
              Por que nos escolher
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight font-outfit"
            >
              O profissional certo
              <br />
              <span className="text-slate-400 font-light">para o seu momento.</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed"
            >
              Sabemos que o primeiro passo é o mais importante. Estamos aqui para torná-lo leve.
            </motion.p>
          </div>

          {/* Stats grid */}
          <motion.div
            variants={stagger}
            className="grid md:grid-cols-3 gap-px bg-slate-200 rounded-3xl overflow-hidden shadow-sm"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white p-10 md:p-12 flex flex-col gap-3 group hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-outfit">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className="text-sm text-slate-500 leading-relaxed">{stat.description}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 group"
            >
              <Link href="/busca" className="flex items-center gap-2">
                Encontrar psicólogo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
