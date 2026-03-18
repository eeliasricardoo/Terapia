'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="w-full min-h-[90vh] flex items-center justify-center bg-white relative overflow-hidden">
      {/* Minimal background accent */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[200px] pointer-events-none" />

      <div className="container px-6 relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95] text-slate-900 font-outfit">
              Encontre seu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                equilíbrio.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto leading-relaxed font-light">
              Conectamos você a psicólogos acolhedores para sessões online seguras. Cuidar da mente
              nunca foi tão simples.
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
              className="h-14 px-10 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5"
            >
              <Link href="/busca" className="flex items-center gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" />
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
            className="flex items-center gap-6 text-sm text-slate-400 pt-4"
          >
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">500+</span> profissionais
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">4.9</span> avaliação média
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">2k+</span> vidas impactadas
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
