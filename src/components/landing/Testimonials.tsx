'use client'

import { motion, Variants } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
}

const testimonialsData = [
  {
    key: 'maria',
    name: 'Maria C.',
    rating: 5,
    initials: 'MC',
    image: '/testimonials/maria.png',
    avatarBg: 'bg-sentirz-teal-pastel',
    avatarColor: 'text-sentirz-teal',
    accentBorder: 'hover:border-sentirz-teal/25',
  },
  {
    key: 'pedro',
    name: 'Dr. Pedro A.',
    rating: 5,
    initials: 'PA',
    image: '/testimonials/pedro.png',
    avatarBg: 'bg-sentirz-green-pastel',
    avatarColor: 'text-sentirz-green',
    accentBorder: 'hover:border-sentirz-green/25',
  },
  {
    key: 'ana',
    name: 'Ana L.',
    rating: 5,
    initials: 'AL',
    image: '/testimonials/ana.png',
    avatarBg: 'bg-sentirz-orange-pastel',
    avatarColor: 'text-sentirz-orange',
    accentBorder: 'hover:border-sentirz-orange/25',
  },
]

export function Testimonials() {
  const t = useTranslations('Testimonials')

  return (
    <section className="w-full py-16 md:py-24 bg-transparent relative overflow-hidden">
      {/* Aspas decorativas */}
      <div className="absolute top-16 left-[5%] text-border hidden sm:block" aria-hidden="true">
        <Quote className="h-20 w-20 sm:h-28 sm:w-28 rotate-180 opacity-40" />
      </div>
      <div className="absolute bottom-16 right-[5%] text-border hidden sm:block" aria-hidden="true">
        <Quote className="h-14 w-14 sm:h-20 sm:w-20 opacity-40" />
      </div>

      {/* Blobs de fundo */}
      <div className="absolute top-0 right-[10%] w-72 h-72 rounded-full bg-sentirz-orange/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[8%] w-64 h-64 rounded-full bg-sentirz-teal/8 blur-[90px] pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-12"
        >
          {/* Section header */}
          <div className="text-center space-y-4">
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
          </div>

          {/* Testimonials grid */}
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {testimonialsData.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className={`bg-card border border-border ${item.accentBorder} rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between gap-6 group`}
              >
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-sentirz-orange fill-sentirz-orange" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground/70 leading-relaxed text-[15px]">
                    &ldquo;{t(`${item.key}.quote`)}&rdquo;
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <div
                    className={`h-11 w-11 rounded-full ${item.avatarBg} ${item.avatarColor} flex items-center justify-center text-xs font-bold shrink-0`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground/45">{t(`${item.key}.role`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
