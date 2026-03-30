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
    <section className="w-full py-16 md:py-20 bg-background relative overflow-hidden">
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
            className="relative bg-sentirz-teal-pastel border border-sentirz-teal/10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 overflow-hidden shadow-sm"
          >
            {/* Illustration decorations */}
            {/* Illustration decoration — Premium Abstract Glassmorphism */}
            <div className="absolute -right-20 -bottom-20 sm:-right-32 sm:-bottom-32 md:-right-20 md:-bottom-20 w-[300px] sm:w-[500px] md:w-[650px] opacity-[0.8] pointer-events-none transition-all group-hover:scale-110 group-hover:rotate-3 duration-1000">
              <Image
                src="/cta-illustration.png"
                alt="Ilustração premium abstrata em vidro orgânico com cores da marca"
                width={650}
                height={650}
                className="object-contain"
                aria-hidden="true"
              />
            </div>

            {/* Subtle gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sentirz-teal/5 via-transparent to-sentirz-green/10 pointer-events-none rounded-[2.5rem]" />

            <div className="relative z-10 space-y-8 max-w-2xl">
              <div className="space-y-6">
                <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">
                  Comece sua jornada
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight font-outfit">
                  Pronto para dar o
                  <br />
                  <span className="text-sentirz-gradient relative">
                    primeiro passo?
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
                <p className="text-lg text-foreground/80 max-w-md leading-relaxed">
                  Cuidar da mente não precisa ser um luxo. Descubra uma terapia profunda, humana e
                  acessível.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 group border-none w-full sm:w-auto"
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
                  className="h-12 sm:h-14 px-6 sm:px-10 text-base font-semibold text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all w-full sm:w-auto"
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
