'use client'

import Link from 'next/link'
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
      <div className="container px-6 relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-12 text-center"
        >
          <motion.div variants={fadeIn} className="space-y-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
              Comece sua jornada
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-outfit">
              Pronto para dar o
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                primeiro passo?
              </span>
            </h2>
            <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              Cuidar da mente não precisa ser um luxo. Descubra uma terapia profunda e acessível.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
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
              className="h-14 px-10 text-base font-semibold text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-all"
            >
              <Link href="/cadastro?role=psychologist">Sou profissional</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
