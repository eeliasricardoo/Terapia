'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Logo } from '@/components/ui/Logo'
import { BRAND_NAME, BRAND_SLOGAN } from '@/lib/constants/branding'

export function Hero() {
  return (
    <section className="w-full min-h-[75vh] flex items-center bg-background relative overflow-hidden">
      {/* Dynamic background accents - Sentirz Style */}
      <div className="absolute top-20 left-10 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-sentirz-teal/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-20 right-20 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-sentirz-green/10 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-sentirz-orange/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none animate-blob animation-delay-4000" />

      <div className="container relative z-10 mx-auto py-12 sm:py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Text content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 sm:space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-sentirz-teal/20 bg-sentirz-teal-pastel shadow-sm"
            >
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                {BRAND_NAME} — {BRAND_SLOGAN}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-foreground font-outfit">
                Sinta a sua <br />
                <span className="text-sentirz-gradient relative">
                  evolução.
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
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-lg leading-relaxed font-medium">
                Conectamos você aos melhores psicólogos para uma jornada de autodescoberta segura,
                humana e moderna. Transforme sua mente com a{' '}
                <span className="text-foreground font-bold">Sentirz</span>.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 group border-none w-full sm:w-auto"
              >
                <Link href="/busca" className="flex items-center gap-2">
                  Começar Jornada
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <RoleSelectionDialog mode="register">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 sm:h-16 px-8 sm:px-12 text-base font-bold border-2 border-primary/30 hover:bg-primary/5 rounded-full transition-all text-primary w-full sm:w-auto"
                >
                  Sou Psicólogo(a)
                </Button>
              </RoleSelectionDialog>
            </motion.div>

            {/* Social proof — minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-foreground/60 pt-4"
            >
              <span className="flex items-center gap-2">
                <span className="font-extrabold text-foreground text-base">500+</span> profissionais
              </span>
              <span className="w-px h-5 bg-border hidden sm:block" />
              <span className="flex items-center gap-2">
                <span className="font-extrabold text-foreground text-base">4.9</span> estrelas
              </span>
              <span className="w-px h-5 bg-border hidden sm:block" />
              <span className="flex items-center gap-2">
                <span className="font-extrabold text-foreground text-base">2k+</span> evoluções
              </span>
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Soft glow behind illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl scale-75 pointer-events-none" />

            <div className="relative">
              <Image
                src="/hero-illustration.png"
                alt="Pessoa em sessão de terapia online, sentada confortavelmente enquanto conversa com seu psicólogo"
                width={580}
                height={580}
                className="relative z-10 drop-shadow-2xl"
                priority
              />

              {/* Floating accent card */}
              {/* Floating accent card 1 - Session */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 bottom-1/4 bg-sentirz-green-pastel backdrop-blur-xl border border-sentirz-green/20 px-5 py-4 rounded-2xl shadow-xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sentirz-green/20 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-sentirz-green"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-sentirz-green/60 uppercase tracking-widest">
                      Sessão
                    </p>
                    <p className="text-sm font-black text-foreground">100% Online</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating accent card 2 - Sigilo */}
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-4 top-1/4 bg-sentirz-teal-pastel backdrop-blur-xl border border-sentirz-teal/20 px-5 py-4 rounded-2xl shadow-xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sentirz-teal/20 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-sentirz-teal"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-sentirz-teal/60 uppercase tracking-widest">
                      Sigilo
                    </p>
                    <p className="text-sm font-black text-foreground">Garantido</p>
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
