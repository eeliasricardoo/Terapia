'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import { motion } from 'framer-motion'
import { CoreHeartIcon, CoreStarIcon, CoreShieldIcon } from '@/components/ui/exclusive-icons'

export function Hero() {
  return (
    <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-[#FFFAF3] overflow-hidden relative bg-mesh">
      {/* Animated Aesthetic Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="space-y-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50/80 backdrop-blur-sm border border-orange-200/50 text-orange-800 text-sm font-medium mb-2 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Terapia Acessível & Solidária
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl/tight font-outfit"
              >
                <span className="text-slate-900">Encontre seu</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600">
                  equilíbrio real.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-slate-600 md:text-xl font-light leading-relaxed max-w-[550px] mx-auto lg:mx-0"
              >
                Um espaço seguro para cuidar de si com terapeutas acolhedores.{' '}
                <span className="font-semibold text-slate-800 underline decoration-orange-200 underline-offset-4">
                  Para profissionais:
                </span>{' '}
                faça parte de uma rede solidária.
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
                className="h-16 px-10 text-lg shadow-2xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-all hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 rounded-2xl"
              >
                <Link href="/busca">Quero fazer terapia</Link>
              </Button>
              <RoleSelectionDialog mode="register">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-10 text-lg border-2 border-slate-200/60 text-slate-700 hover:bg-white hover:border-orange-200 transition-all hover:-translate-y-1 bg-white/40 backdrop-blur-md rounded-2xl"
                >
                  Sou Psicólogo(a)
                </Button>
              </RoleSelectionDialog>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-8 pt-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?u=${i + 10}`}
                        alt="User avatar"
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                    +2k
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium ml-1">Vidas impactadas</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                <div className="flex items-center gap-1 text-amber-500">
                  <CoreStarIcon className="h-4 w-4" />
                  <CoreStarIcon className="h-4 w-4" />
                  <CoreStarIcon className="h-4 w-4" />
                  <CoreStarIcon className="h-4 w-4" />
                  <CoreStarIcon className="h-4 w-4" />
                </div>
                <span>4.9/5 Estrelas</span>
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
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/30 to-rose-200/30 blur-3xl rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000" />

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/80 bg-white/20 backdrop-blur-sm p-3"
              >
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/4] w-full">
                  <Image
                    src="/hero-therapy-aesthetic.png"
                    alt="Ilustração Terapia Saúde Mental"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-40" />
                </div>
              </motion.div>

              {/* Float Cards */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-10 top-1/4 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <CoreHeartIcon className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Acolhimento
                  </p>
                  <p className="text-sm font-bold text-slate-900">100% Humanizado</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-6 bottom-1/4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <CoreShieldIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Seguro
                  </p>
                  <p className="text-sm font-bold text-white">Privacidade Total</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
