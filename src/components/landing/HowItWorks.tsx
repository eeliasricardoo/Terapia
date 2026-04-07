'use client'

import { motion, Variants } from 'framer-motion'
import { Search, CalendarDays, Video, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } },
}

const stepsData = [
  {
    icon: Search,
    key: 'search',
    accent: 'bg-sentirz-teal',
    lightAccent: 'bg-sentirz-teal-pastel text-sentirz-teal',
  },
  {
    icon: CalendarDays,
    key: 'schedule',
    accent: 'bg-sentirz-green',
    lightAccent: 'bg-sentirz-green-pastel text-sentirz-green',
  },
  {
    icon: Video,
    key: 'connect',
    accent: 'bg-sentirz-orange',
    lightAccent: 'bg-sentirz-orange-pastel text-sentirz-orange',
  },
  {
    icon: Heart,
    key: 'evolve',
    accent: 'bg-sentirz-teal',
    lightAccent: 'bg-sentirz-teal-pastel text-sentirz-teal',
  },
]

export function HowItWorks() {
  const t = useTranslations('HowItWorks')

  return (
    <section className="w-full py-16 md:py-28 bg-transparent relative overflow-hidden">
      {/* Blobs suaves de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sentirz-green/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sentirz-teal/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-12"
        >
          {/* Section header */}
          <div className="text-center space-y-5">
            <motion.p
              variants={fadeIn}
              className="text-xs font-semibold text-foreground/40 uppercase tracking-[0.2em]"
            >
              {t('badge')}
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-outfit"
            >
              {t('title')}
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-foreground/60 max-w-md mx-auto leading-relaxed"
            >
              {t('description')}
            </motion.p>
          </div>

          {/* Steps */}
          <motion.div variants={stagger} className="relative">
            {/* Connection line */}
            <div
              className="absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent hidden md:block"
              aria-hidden="true"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stepsData.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="flex flex-col items-center text-center gap-5 group"
                >
                  {/* Ícone + badge */}
                  <div className="relative">
                    <div
                      className={`h-24 w-24 md:h-28 md:w-28 rounded-[2rem] ${step.lightAccent} flex items-center justify-center group-hover:scale-110 transition-all duration-500 border border-primary/5 shadow-sm`}
                    >
                      <step.icon className="h-8 w-8" />
                    </div>
                    {/* Badge numérico */}
                    <div
                      className={`absolute -top-2.5 -right-1.5 h-7 w-7 rounded-full ${step.accent} text-primary-foreground text-xs font-black flex items-center justify-center shadow-md transform rotate-6 ring-2 ring-background`}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-foreground">
                      {t(`steps.${step.key}.title`)}
                    </h3>
                    <p className="text-sm text-foreground/55 leading-relaxed max-w-[180px] mx-auto">
                      {t(`steps.${step.key}.desc`)}
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
