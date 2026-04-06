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
    <section className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-16 right-[12%] w-2 h-2 rounded-full bg-sentirz-green/40" />
      <div className="absolute bottom-24 left-[8%] w-3 h-3 rounded-full bg-sentirz-teal/30" />

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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6">
              {stepsData.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="flex flex-col items-center text-center gap-5 group"
                >
                  {/* Step number + icon */}
                  <div className="relative">
                    <div
                      className={`h-[104px] w-[104px] rounded-[2.5rem] ${step.lightAccent} flex items-center justify-center group-hover:scale-110 transition-all duration-500 border border-primary/5 shadow-sm`}
                    >
                      <step.icon className="h-8 w-8" />
                    </div>
                    {/* Step number badge */}
                    <div
                      className={`absolute -top-2 -right-1 h-7 w-7 rounded-full ${step.accent} text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg transform rotate-6 border-2 border-white`}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{t(`steps.${step.key}.title`)}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed max-w-[200px] mx-auto">
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
