'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="w-full min-h-[92vh] flex items-center bg-white relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-50/60 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none" />

      {/* Decorative organic dots */}
      <div className="absolute top-1/4 right-[15%] w-3 h-3 rounded-full bg-blue-200/60" />
      <div className="absolute top-[60%] left-[8%] w-2 h-2 rounded-full bg-indigo-200/80" />
      <div className="absolute bottom-[30%] right-[10%] w-2.5 h-2.5 rounded-full bg-amber-200/60" />

      <div className="container px-6 relative z-10 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Plataforma Online de Terapia
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-slate-900 font-outfit">
                Encontre seu
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                  equilíbrio.
                  {/* Decorative underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue-200/60"
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
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-light">
                Conectamos você a psicólogos acolhedores para sessões online seguras. Cuidar da
                mente nunca foi tão simples.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 group"
              >
                <Link href="/busca" className="flex items-center gap-2">
                  Começar agora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <RoleSelectionDialog mode="register">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-10 text-base font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
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
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 pt-4"
            >
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">500+</span> profissionais
              </span>
              <span className="w-px h-4 bg-slate-200 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">4.9</span> avaliação média
              </span>
              <span className="w-px h-4 bg-slate-200 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">2k+</span> vidas impactadas
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
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 bottom-1/4 bg-white/95 backdrop-blur-xl border border-slate-100 px-5 py-4 rounded-2xl shadow-xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-emerald-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Sessão
                    </p>
                    <p className="text-sm font-bold text-slate-900">100% Online</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating accent card 2 */}
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-4 top-1/4 bg-slate-900/95 backdrop-blur-xl border border-white/10 px-5 py-4 rounded-2xl shadow-xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Sigilo
                    </p>
                    <p className="text-sm font-bold text-white">Garantido</p>
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
