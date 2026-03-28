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
    color: 'from-sentirz-teal/5 to-sentirz-teal/10',
    iconColor: 'text-sentirz-teal',
    borderColor: 'border-sentirz-teal/20',
    hoverBg: 'group-hover:bg-sentirz-teal',
  },
  {
    icon: Video,
    title: 'Sessões Humanizadas',
    description:
      'Vídeo-chamadas de alta qualidade direto do navegador, com foco total no seu acolhimento.',
    number: '02',
    color: 'from-sentirz-orange/5 to-sentirz-orange/10',
    iconColor: 'text-sentirz-orange',
    borderColor: 'border-sentirz-orange/20',
    hoverBg: 'group-hover:bg-sentirz-orange',
  },
  {
    icon: Shield,
    title: 'Espaço 100% Seguro',
    description: 'Criptografia de ponta a ponta e sigilo absoluto garantido em cada conversa.',
    number: '03',
    color: 'from-sentirz-green/5 to-sentirz-green/10',
    iconColor: 'text-sentirz-green',
    borderColor: 'border-sentirz-green/20',
    hoverBg: 'group-hover:bg-sentirz-green',
  },
]

export function Features() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-background relative overflow-hidden">
      {/* Decorative organic shapes - Sentirz Style */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-sentirz-teal/10 blur-[80px]" />
      <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full bg-sentirz-orange/10 blur-[60px]" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
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
              className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]"
            >
              <Sparkles className="h-4 w-4" />
              Diferenciais
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground font-outfit"
            >
              Por que a Sentirz?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-foreground/60 max-w-md mx-auto leading-relaxed"
            >
              Tecnologia e empatia unidos para o seu despertar pessoal.
            </motion.p>
          </div>

          {/* Features cards */}
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.number}
                variants={fadeIn}
                className="group relative bg-white border border-primary/10 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Subtle gradient bg on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-[2rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 space-y-6">
                  {/* Number */}
                  <span className="text-[10px] font-mono text-foreground/20 font-bold tracking-widest uppercase">
                    Feature {feature.number}
                  </span>

                  {/* Icon */}
                  <div
                    className={`h-14 w-14 rounded-2xl bg-sentirz-bg border ${feature.borderColor} flex items-center justify-center ${feature.hoverBg} group-hover:border-transparent transition-all duration-300`}
                  >
                    <feature.icon
                      className={`h-6 w-6 ${feature.iconColor} group-hover:text-primary-foreground transition-colors duration-300`}
                    />
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-foreground/60 leading-relaxed text-[15px]">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg
                    className="h-6 w-6 text-foreground/10"
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
