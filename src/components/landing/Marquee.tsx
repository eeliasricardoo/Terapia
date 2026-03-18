'use client'

import { motion } from 'framer-motion'

const words = [
  'Acolhimento',
  '✦',
  'Empatia',
  '✦',
  'Privacidade',
  '✦',
  'Autoconhecimento',
  '✦',
  'Bem-estar',
  '✦',
  'Saúde Mental',
  '✦',
  'Equilíbrio',
  '✦',
  'Cuidado',
  '✦',
]

export function Marquee() {
  return (
    <section className="w-full py-6 bg-slate-900 overflow-hidden relative">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 shrink-0"
        >
          {[...words, ...words].map((word, i) => (
            <span
              key={i}
              className={`text-sm font-medium tracking-widest uppercase ${
                word === '✦' ? 'text-blue-400 text-xs' : 'text-white/60'
              }`}
            >
              {word}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
