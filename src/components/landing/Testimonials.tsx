'use client'

import { motion, Variants } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
}

const testimonials = [
  {
    quote:
      'A terapia online mudou completamente a minha vida. Encontrei uma profissional incrível que me ajuda a evoluir a cada sessão.',
    name: 'Maria C.',
    role: 'Paciente há 8 meses',
    rating: 5,
    initials: 'MC',
    image: '/testimonials/maria.png',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    quote:
      'Como psicólogo, a plataforma me deu a liberdade de atender de forma humanizada, com toda a segurança que meus pacientes precisam.',
    name: 'Dr. Pedro A.',
    role: 'Psicólogo',
    rating: 5,
    initials: 'PA',
    image: '/testimonials/pedro.png',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    quote:
      'O primeiro passo é sempre o mais difícil, mas a plataforma tornou tudo muito simples. Recomendo de olhos fechados.',
    name: 'Ana L.',
    role: 'Paciente há 1 ano',
    rating: 5,
    initials: 'AL',
    image: '/testimonials/ana.png',
    color: 'bg-amber-50 text-amber-600',
  },
]

export function Testimonials() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative quotes */}
      <div className="absolute top-20 left-[5%] text-slate-100 hidden sm:block" aria-hidden="true">
        <Quote className="h-24 w-24 sm:h-32 sm:w-32 rotate-180" />
      </div>
      <div
        className="absolute bottom-16 right-[5%] text-slate-100 hidden sm:block"
        aria-hidden="true"
      >
        <Quote className="h-16 w-16 sm:h-24 sm:w-24" />
      </div>

      {/* Organic dots */}
      <div className="absolute top-1/3 right-[10%] w-2 h-2 rounded-full bg-amber-200/50" />
      <div className="absolute bottom-1/4 left-[12%] w-2.5 h-2.5 rounded-full bg-blue-200/40" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-12"
        >
          {/* Section header */}
          <div className="text-center space-y-5">
            <motion.p
              variants={fadeIn}
              className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]"
            >
              Depoimentos
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-outfit"
            >
              O que dizem sobre nós
            </motion.h2>
          </div>

          {/* Testimonials grid */}
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:shadow-lg hover:shadow-slate-100/80 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-5">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 leading-relaxed text-[15px]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-slate-50"
                    />
                  ) : (
                    <div
                      className={`h-12 w-12 rounded-full ${t.color} flex items-center justify-center text-xs font-bold`}
                    >
                      {t.initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
