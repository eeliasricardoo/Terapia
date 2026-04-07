'use client'

import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export function CTA() {
  const t = useTranslations('CTA')

  return (
    <section className="w-full py-16 md:py-20 bg-transparent relative overflow-hidden">
      {/* Decorative organic dots */}
      <div className="absolute top-16 left-[10%] w-2 h-2 rounded-full bg-sentirz-teal/60" />
      <div className="absolute bottom-20 right-[15%] w-3 h-3 rounded-full bg-sentirz-green/50" />
      <div className="absolute top-1/3 right-[8%] w-2 h-2 rounded-full bg-sentirz-orange/40" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background card */}
          <motion.div
            variants={fadeIn}
            className="group relative bg-white border border-sentirz-teal/10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 overflow-hidden shadow-sm"
          >
            <div className="relative z-10 space-y-8 max-w-2xl mx-auto text-center flex flex-col items-center">
              <div className="space-y-6">
                <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">
                  {t('badge')}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight font-outfit">
                  {t('title1')}
                  <br />
                  <span className="text-sentirz-gradient relative">
                    {t('title2')}
                    {/* Decorative underline */}
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-secondary/60"
                      viewBox="0 0 200 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 8C30 3 60 2 100 6C140 10 170 4 198 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>
                <p className="text-lg text-foreground/80 max-w-md leading-relaxed mx-auto">
                  {t('description')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 group border-none w-full sm:w-auto"
                >
                  <Link href="/busca" className="flex items-center gap-2">
                    {t('buttons.findPsychologist')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-10 text-base font-semibold text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all w-full sm:w-auto"
                >
                  <Link href="/cadastro?role=psychologist">{t('buttons.iamProfessional')}</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
                {(['privacy', 'security', 'noCommitment'] as const).map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 text-sm text-foreground/50">
                    <CheckCircle2
                      className="h-4 w-4 text-sentirz-green shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t(`badges.${badge}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
