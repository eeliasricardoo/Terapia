'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Marquee() {
  const t = useTranslations('Marquee')
  const words = Array.from({ length: 8 }).map((_, i) => t(`word${i}`))
  return (
    <section className="w-full py-8 bg-white overflow-hidden relative border-y border-slate-100">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-16 shrink-0"
        >
          {[...words, ...words].map((word, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">
                {word}
              </span>
              <Heart className="w-4 h-4 text-rose-400 fill-rose-100" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
