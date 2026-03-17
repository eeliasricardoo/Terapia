'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

const fadeIn: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 40 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export function CTA() {
  return (
    <section className="w-full py-20 md:py-40 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-5xl font-outfit">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="relative group box-border"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-700" />

          <div className="relative flex flex-col items-center justify-center space-y-10 text-center bg-slate-900 border border-white/10 p-12 md:p-24 rounded-[3rem] shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity scale-110 group-hover:scale-100 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/20" />

            <div className="relative z-10 space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-500">
                <Heart className="h-10 w-10 text-blue-400" />
              </div>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Pronto para dar o <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  primeiro passo?
                </span>
              </h2>
              <p className="mx-auto max-w-[600px] text-slate-400 text-xl font-light leading-relaxed">
                Cuidar da mente não precisa ser um luxo. Descubra uma terapia profunda e acessível.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 pt-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-lg bg-white text-slate-900 hover:bg-blue-50 shadow-2xl transition-all rounded-2xl border-0"
              >
                <Link href="/busca" className="flex items-center gap-3 font-bold">
                  Encontrar Meu Psicólogo
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="relative z-10 text-slate-500 text-sm mt-8 font-medium">
              É um profissional?{' '}
              <Link
                href="/cadastro?role=psychologist"
                className="text-blue-400 hover:text-white transition-colors"
              >
                Junte-se ao movimento solidário
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
