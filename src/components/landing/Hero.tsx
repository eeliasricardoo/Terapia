'use client'

import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BRAND_NAME, BRAND_SLOGAN } from '@/lib/constants/branding'

export function Hero() {
  const t = useTranslations('Hero')

  return (
    <section className="w-full min-h-[90vh] flex items-center bg-transparent relative overflow-hidden">
      {/* Background blobs — visíveis e com identidade */}
      <div className="absolute -top-10 -left-20 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-sentirz-teal/[0.08] rounded-full blur-[120px] sm:blur-[160px] pointer-events-none animate-blob" />
      <div className="absolute -bottom-20 -right-10 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] bg-sentirz-green/[0.05] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-sentirz-orange/[0.03] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-blob animation-delay-4000" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Lado esquerdo: conteúdo ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sentirz-teal/25 bg-sentirz-teal-pastel text-primary text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sentirz-teal animate-pulse" />
              {BRAND_NAME} — {BRAND_SLOGAN}
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.88] text-foreground font-outfit">
                {t('titlePart1')}
                <br />
                <span className="text-sentirz-gradient relative inline-block">
                  {t('titleHighlight')}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-secondary/50"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8C30 3 60 2 100 6C140 10 170 4 198 7"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 max-w-md leading-relaxed">
                {t('description')}
                <span className="text-foreground font-bold"> {BRAND_NAME}</span>.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 group border-none"
              >
                <Link href="/busca" className="flex items-center gap-2">
                  {t('buttons.startJourney')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <RoleSelectionDialog mode="register">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-bold border-2 border-primary/25 hover:bg-primary/5 hover:border-primary/40 rounded-full transition-all text-primary"
                >
                  {t('buttons.imPsychologist')}
                </Button>
              </RoleSelectionDialog>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              {[
                { icon: CheckCircle2, label: `500+ ${t('stats.professionals')}` },
                { icon: Shield, label: t('stats.stars') },
                { icon: CheckCircle2, label: `2k+ ${t('stats.evolutions')}` },
              ].map(({ icon: Icon, label }, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 bg-muted/60 border border-border/60 px-3 py-1.5 rounded-full"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── Lado direito: ilustração ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Glow de fundo com cores da marca */}
            <div className="absolute inset-0 bg-gradient-to-br from-sentirz-teal/25 via-sentirz-green/10 to-sentirz-orange/10 rounded-full blur-3xl scale-90 pointer-events-none" />

            {/* Ilustração principal */}
            <div className="relative z-10">
              <Image
                src="/hero-illustration.png"
                alt="Pessoa em sessão de terapia online, sentada confortavelmente enquanto conversa com seu psicólogo"
                width={560}
                height={560}
                className="drop-shadow-2xl"
                priority
              />

              {/* Card flutuante — Sessão */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-8 bottom-[28%] bg-sentirz-green-pastel/90 backdrop-blur-xl border border-sentirz-green/20 px-4 py-3 rounded-2xl shadow-lg z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-sentirz-green/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-sentirz-green" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-sentirz-green/60 uppercase tracking-widest leading-none mb-0.5">
                      {t('floatingCards.session')}
                    </p>
                    <p className="text-sm font-black text-foreground leading-none">
                      {t('floatingCards.online')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card flutuante — Sigilo */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-6 top-[22%] bg-sentirz-teal-pastel/90 backdrop-blur-xl border border-sentirz-teal/20 px-4 py-3 rounded-2xl shadow-lg z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-sentirz-teal/20 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-sentirz-teal" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-sentirz-teal/60 uppercase tracking-widest leading-none mb-0.5">
                      {t('floatingCards.privacy')}
                    </p>
                    <p className="text-sm font-black text-foreground leading-none">
                      {t('floatingCards.guaranteed')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
