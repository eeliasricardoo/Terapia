'use client'

import { motion, Variants } from 'framer-motion'
import { Heart, Video, Shield } from 'lucide-react'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } },
}

const features = [
  {
    icon: Heart,
    title: 'Conexão Genuína',
    description:
      'Encontre o profissional certo por afinidade e verdadeiro respeito à sua história.',
    number: '01',
  },
  {
    icon: Video,
    title: 'Sessões Humanizadas',
    description:
      'Vídeo-chamadas de alta qualidade direto do seu navegador, com foco no acolhimento.',
    number: '02',
  },
  {
    icon: Shield,
    title: 'Seu Espaço Seguro',
    description: 'Criptografia de ponta a ponta e anonimato garantido em cada sessão.',
    number: '03',
  },
]

export function Features() {
  return (
    <section className="w-full py-32 md:py-40 bg-white relative">
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
              Diferenciais
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-outfit"
            >
              Porque escolher a Terapia?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed"
            >
              Tecnologia e empatia unidos para o seu crescimento pessoal.
            </motion.p>
          </div>

          {/* Features list */}
          <motion.div variants={stagger} className="space-y-0 divide-y divide-slate-100">
            {features.map((feature) => (
              <motion.div
                key={feature.number}
                variants={fadeIn}
                className="group grid md:grid-cols-12 gap-6 py-12 md:py-16 items-start"
              >
                {/* Number */}
                <div className="md:col-span-1">
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    {feature.number}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-300">
                    <feature.icon className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                </div>

                {/* Description */}
                <div className="md:col-span-7">
                  <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
