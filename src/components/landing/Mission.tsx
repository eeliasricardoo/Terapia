'use client'

import Image from 'next/image'
import { motion, Variants } from 'framer-motion'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } },
}

export function Mission() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-white relative overflow-hidden">
      {/* Dynamic background accents - Sentirz Style */}
      <div className="absolute top-0 left-0 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-primary/10 rounded-full blur-[80px] sm:blur-[150px] pointer-events-none animate-blob" />
      <div className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-accent/10 rounded-full blur-[60px] sm:blur-[120px] pointer-events-none animate-blob animation-delay-2000" />

      {/* Organic dots */}
      <div className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-primary/20" />
      <div className="absolute bottom-24 left-[10%] w-4 h-4 rounded-full bg-accent/20" />

      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-5xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Main content */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left - Illustration */}
            <motion.div variants={fadeIn} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/10 rounded-[3rem] blur-2xl pointer-events-none" />
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-slate-100">
                <Image
                  src="/cta-illustration.png"
                  alt="Ilustração representando conexão e acolhimento entre terapeuta e paciente"
                  width={480}
                  height={480}
                  className="w-full h-auto"
                />
              </div>

              {/* Floating quote */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-4 md:-right-8 bg-white border border-slate-100 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg max-w-[200px] sm:max-w-[240px] z-20"
              >
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  &ldquo;Pedir ajuda é o primeiro passo para se sentir melhor.&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Sentirz Reminder
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Text */}
            <motion.div variants={stagger} className="space-y-8">
              <motion.p
                variants={fadeIn}
                className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]"
              >
                Nossa missão
              </motion.p>

              <motion.h2
                variants={fadeIn}
                className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-midnight dark:text-white leading-[1.1] font-outfit"
              >
                Todo mundo merece
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  ser ouvido.
                </span>
              </motion.h2>

              <motion.div variants={stagger} className="space-y-5">
                <motion.p variants={fadeIn} className="text-slate-500 text-lg leading-relaxed">
                  Sabemos que falar sobre o que sentimos nem sempre é fácil. A vida é cheia de
                  momentos desafiadores — ansiedade, estresse, dificuldades nos relacionamentos, ou
                  simplesmente a necessidade de ter alguém que te escute.
                </motion.p>

                <motion.p variants={fadeIn} className="text-slate-500 text-lg leading-relaxed">
                  A <span className="font-bold text-midnight dark:text-white">Sentirz</span> nasceu
                  para tornar esse caminho mais leve. Conectamos você a profissionais acolhedores e
                  preparados, em um espaço seguro e sem julgamentos — tudo online, no seu ritmo.
                </motion.p>

                <motion.p variants={fadeIn} className="text-slate-500 text-lg leading-relaxed">
                  Não importa se é a sua primeira vez ou se você já faz terapia há anos. Aqui, o
                  mais importante é <span className="font-semibold text-slate-700">você</span>.
                </motion.p>
              </motion.div>

              {/* Values list */}
              <motion.div variants={fadeIn} className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { emoji: '🤝', text: 'Sem julgamentos' },
                  { emoji: '🔒', text: 'Sigilo absoluto' },
                  { emoji: '💙', text: 'Acolhimento real' },
                  { emoji: '🏠', text: 'No conforto de casa' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                  >
                    <span className="text-lg" role="img" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
