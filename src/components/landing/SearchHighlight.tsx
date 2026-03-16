'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowRight } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { CoreUsersIcon, CoreStarIcon, CoreClockIcon } from '@/components/ui/exclusive-icons'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

interface SearchHighlightProps {
  totalPsychologists?: number
}

export function SearchHighlight({ totalPsychologists = 500 }: SearchHighlightProps) {
  return (
    <section className="w-full py-20 md:py-40 bg-white relative overflow-hidden">
      {/* Subtle Background Textures */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[length:40px_40px] pointer-events-none" />
      <div className="absolute -top-24 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl font-outfit">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          {/* Left side - Content */}
          <div className="space-y-10">
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-800 tracking-wide uppercase">
                Encontre a sua melhor versão
              </span>
            </motion.div>

            <motion.h2
              variants={fadeIn}
              className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              O profissional certo
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 mt-2">
                para o seu momento
              </span>
            </motion.h2>

            <motion.p
              variants={fadeIn}
              className="text-xl text-slate-500 max-w-xl leading-relaxed font-light"
            >
              Sabemos que o primeiro passo é o mais importante. Nossa plataforma ajuda você a
              encontrar um psicólogo de forma leve e respeitosa.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button
                asChild
                size="lg"
                className="group h-16 px-10 text-lg bg-slate-900 hover:bg-black text-white shadow-2xl transition-all rounded-2xl"
              >
                <Link href="/busca" className="flex items-center gap-3">
                  <Search className="h-5 w-5 opacity-70" />
                  Quero conhecer
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-16 px-10 text-lg text-slate-600 hover:text-slate-900 border-2 border-transparent hover:border-slate-100 rounded-2xl transition-all"
              >
                <Link href="/cadastro">Começar Gratuitamente</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right side - Stats/Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <motion.div
              variants={fadeIn}
              className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 group"
            >
              <div className="flex flex-col gap-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <CoreUsersIcon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-4xl text-slate-900 mb-2">
                    {totalPsychologists}+
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Especialistas acolhedores e verificados.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-slate-900 border border-white/10 rounded-[2rem] p-10 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 group"
            >
              <div className="flex flex-col gap-6">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <CoreStarIcon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-4xl text-white mb-2">4.9/5</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Avaliação média baseada em cuidado real.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="sm:col-span-2 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <CoreClockIcon className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-2xl text-slate-900 mb-4 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-indigo-200/50 flex items-center justify-center">
                    <CoreClockIcon className="h-4 w-4 text-indigo-700" />
                  </span>
                  Terapia que se adapta a você
                </h3>
                <p className="text-slate-600 font-medium text-lg max-w-xl">
                  Sessões online no seu ritmo e espaço. Cuidado 24/7 com máxima privacidade e
                  segurança.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
