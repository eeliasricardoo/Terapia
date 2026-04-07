'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Marquee() {
  const t = useTranslations('Marquee')
  const words = Array.from({ length: 8 }).map((_, i) => t(`word${i}`))
  return (
    <section className="w-full py-5 bg-sentirz-teal-pastel overflow-hidden relative border-y border-sentirz-teal/15">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-12 shrink-0"
        >
          {[...words, ...words].map((word, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/50">
                {word}
              </span>
              <Heart className="w-3.5 h-3.5 text-primary/40 fill-primary/10 shrink-0" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
