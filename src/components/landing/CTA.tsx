'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export function CTA() {
  return (
    <section className="w-full py-32 md:py-40 bg-slate-50 relative overflow-hidden">
      {/* Decorative organic dots */}
      <div className="absolute top-16 left-[10%] w-2 h-2 rounded-full bg-blue-200/60" />
      <div className="absolute bottom-20 right-[15%] w-3 h-3 rounded-full bg-indigo-200/50" />
      <div className="absolute top-1/3 right-[8%] w-2 h-2 rounded-full bg-amber-200/40" />

      <div className="container px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background card */}
          <motion.div
            variants={fadeIn}
            className="relative bg-white border border-slate-100 rounded-[2.5rem] p-12 md:p-20 overflow-hidden shadow-sm"
          >
            {/* Illustration decorations */}
            <div className="absolute -right-10 -bottom-10 md:right-8 md:bottom-8 w-[280px] md:w-[360px] opacity-[0.08] pointer-events-none">
              <Image
                src="/cta-illustration.png"
                alt=""
                width={360}
                height={360}
                className="object-contain"
                aria-hidden="true"
              />
            </div>

            {/* Subtle gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 pointer-events-none rounded-[2.5rem]" />

            <div className="relative z-10 space-y-8 max-w-2xl">
              <div className="space-y-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
                  Comece sua jornada
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-outfit">
                  Pronto para dar o
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    primeiro passo?
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
                </h2>
                <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                  Cuidar da mente não precisa ser um luxo. Descubra uma terapia profunda e
                  acessível.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-10 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 group"
                >
                  <Link href="/busca" className="flex items-center gap-2">
                    Encontrar Meu Psicólogo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 px-10 text-base font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                >
                  <Link href="/cadastro?role=psychologist">Sou profissional</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg
                    className="h-4 w-4 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Sigilo garantido</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg
                    className="h-4 w-4 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg
                    className="h-4 w-4 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Sem compromisso</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
