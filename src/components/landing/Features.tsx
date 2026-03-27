'use client'

import { motion, Variants } from 'framer-motion'
import { Heart, Video, Shield, Sparkles } from 'lucide-react'

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
    color: 'from-rose-50 to-pink-50',
    iconColor: 'text-rose-500',
    borderColor: 'border-rose-100',
    hoverBg: 'group-hover:bg-rose-500',
  },
  {
    icon: Video,
    title: 'Sessões Humanizadas',
    description:
      'Vídeo-chamadas de alta qualidade direto do navegador, construídas com foco no acolhimento.',
    number: '02',
    color: 'from-blue-50 to-indigo-50',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-100',
    hoverBg: 'group-hover:bg-blue-500',
  },
  {
    icon: Shield,
    title: 'Seu Espaço Seguro',
    description: 'Criptografia de ponta a ponta e anonimato garantido em cada sessão.',
    number: '03',
    color: 'from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-100',
    hoverBg: 'group-hover:bg-emerald-500',
  },
]

export function Features() {
  return (
    <section className="w-full py-32 md:py-40 bg-white relative overflow-hidden">
      {/* Decorative organic shapes */}
      <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-blue-200/60" />
      <div className="absolute bottom-32 left-16 w-3 h-3 rounded-full bg-rose-200/40" />
      <div className="absolute top-1/2 right-[5%] w-2 h-2 rounded-full bg-emerald-200/50" />

      {/* Decorative wavy line */}
      <svg
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[300px] h-6 text-slate-100 opacity-60"
        viewBox="0 0 300 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0 10C50 2 100 18 150 10C200 2 250 18 300 10"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

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
            <motion.div
              variants={fadeIn}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Diferenciais
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-outfit"
            >
              Porque escolher a Mind Cares?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed"
            >
              Tecnologia e empatia unidos para o seu crescimento pessoal.
            </motion.p>
          </div>

          {/* Features cards */}
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.number}
                variants={fadeIn}
                className="group relative bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Subtle gradient bg on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 space-y-6">
                  {/* Number */}
                  <span className="text-[10px] font-mono text-slate-300 font-bold tracking-widest">
                    {feature.number}
                  </span>

                  {/* Icon */}
                  <div
                    className={`h-14 w-14 rounded-2xl bg-slate-50 border ${feature.borderColor} flex items-center justify-center ${feature.hoverBg} group-hover:border-transparent transition-all duration-300`}
                  >
                    <feature.icon
                      className={`h-6 w-6 ${feature.iconColor} group-hover:text-white transition-colors duration-300`}
                    />
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-[15px]">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg
                    className="h-6 w-6 text-slate-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
