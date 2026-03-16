'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function BlogHero() {
  return (
    <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 bg-[#F9F5FF] overflow-hidden relative bg-mesh-purple">
      {/* Animated Aesthetic Blobs - Purple/Lavender themed */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-fuchsia-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit text-slate-900">
            Conhecimento que <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-600">
              nos aproxima.
            </span>
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Explore artigos, dicas e reflexões sobre saúde mental escritos por quem entende do
            assunto.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 max-w-lg mx-auto relative"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <Input
              placeholder="O que você deseja ler hoje?"
              className="h-14 pl-12 pr-4 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-md shadow-xl focus-visible:ring-purple-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {['Ansiedade', 'Relacionamentos', 'Carreira', 'Autoestima', 'Luto'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 rounded-full bg-white border border-slate-100 text-sm font-medium text-slate-600 hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
