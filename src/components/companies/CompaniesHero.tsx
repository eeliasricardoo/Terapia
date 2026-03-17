'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CoreUsersIcon, CoreShieldIcon, CoreStarIcon } from '@/components/ui/exclusive-icons'

export function CompaniesHero() {
  return (
    <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-[#F3F8FF] overflow-hidden relative bg-mesh-blue">
      {/* Animated Aesthetic Blobs - Blue/Indigo themed */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="space-y-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-800 text-sm font-medium mb-2 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Terapia Corporativa
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl/tight font-outfit"
              >
                <span className="text-slate-900">Cuide da</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-600">
                  saúde do seu time.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-slate-600 md:text-xl font-light leading-relaxed max-w-[550px] mx-auto lg:mx-0"
              >
                Reduza o burnout, aumente o engajamento e construa uma cultura de bem-estar com
                nossa plataforma de terapia corporativa.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="h-16 px-10 text-lg shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-0 rounded-2xl"
              >
                <Link href="#contato">Falar com um consultor</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 px-10 text-lg border-2 border-slate-200/60 text-slate-700 hover:bg-white hover:border-blue-200 transition-all hover:-translate-y-1 bg-white/40 backdrop-blur-md rounded-2xl"
              >
                Ver demonstração
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-8 pt-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-2">
                  Empresas que confiam
                </p>
                <div className="flex items-center gap-6 opacity-40 grayscale">
                  <div className="h-6 w-24 bg-slate-400 rounded-md" />
                  <div className="h-6 w-24 bg-slate-400 rounded-md" />
                  <div className="h-6 w-24 bg-slate-400 rounded-md" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Image / Illustration content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full mt-8 lg:mt-0"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 blur-3xl rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000" />

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/80 bg-white/20 backdrop-blur-sm p-3"
              >
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/4] w-full bg-white flex items-center justify-center p-8">
                  {/* I'll use a placeholder image for now, but in a real scenario I'd generate or use a specific one */}
                  <Image
                    src="/corporate-wellness.png"
                    alt="Bem-estar Corporativo"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-40" />
                </div>
              </motion.div>

              {/* Float Cards */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-10 top-1/4 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CoreUsersIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Equipe
                  </p>
                  <p className="text-sm font-bold text-slate-900">+ Engajamento</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-6 bottom-1/4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <CoreShieldIcon className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Resultados
                  </p>
                  <p className="text-sm font-bold text-white">Relatórios em Tempo Real</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
