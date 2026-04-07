'use client'

import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Star, Clock } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('SearchHighlight')

  const stats = [
    {
      icon: Users,
      value: `${totalPsychologists}+`,
      label: t('stats.verified.label'),
      description: t('stats.verified.desc'),
      iconBg: 'bg-sentirz-teal-pastel',
      iconColor: 'text-sentirz-teal',
      hoverBorder: 'hover:border-sentirz-teal/30',
      glow: 'hover:shadow-sentirz-teal/10',
    },
    {
      icon: Star,
      value: '4.9/5',
      label: t('stats.rating.label'),
      description: t('stats.rating.desc'),
      iconBg: 'bg-sentirz-orange-pastel',
      iconColor: 'text-sentirz-orange',
      hoverBorder: 'hover:border-sentirz-orange/30',
      glow: 'hover:shadow-sentirz-orange/10',
    },
    {
      icon: Clock,
      value: '24/7',
      label: t('stats.availability.label'),
      description: t('stats.availability.desc'),
      iconBg: 'bg-sentirz-green-pastel',
      iconColor: 'text-sentirz-green',
      hoverBorder: 'hover:border-sentirz-green/30',
      glow: 'hover:shadow-sentirz-green/10',
    },
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-transparent relative overflow-hidden">
      {/* Grid pattern sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[length:64px_64px] pointer-events-none" />

      {/* Blobs decorativos */}
      <div className="absolute top-0 left-[5%] w-64 h-64 rounded-full bg-sentirz-teal/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-[8%] w-56 h-56 rounded-full bg-sentirz-green/8 blur-[80px] pointer-events-none" />

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
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight font-outfit"
            >
              {t('title1')}
              <br />
              <span className="text-foreground/35 font-light">{t('title2')}</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-foreground/60 max-w-md mx-auto leading-relaxed"
            >
              {t('description')}
            </motion.p>
          </div>

          {/* Stats grid */}
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-5">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className={`bg-card border border-border rounded-3xl p-8 flex flex-col gap-5 group ${stat.hoverBorder} hover:shadow-xl ${stat.glow} hover:-translate-y-1 transition-all duration-500`}
              >
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight font-outfit block">
                    {stat.value}
                  </span>
                  <p className="text-sm font-bold text-foreground/80 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-sm text-foreground/55 leading-relaxed">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 group border-none"
            >
              <Link href="/busca" className="flex items-center gap-2">
                {t('button')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
