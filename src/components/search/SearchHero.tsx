'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CoreStarIcon, CoreShieldIcon, CoreHeartIcon } from '@/components/ui/exclusive-icons'

export function SearchHero() {
  return (
    <section className="w-full pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white overflow-hidden relative border-b border-slate-100">
      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-12">
          <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 text-rose-800 text-sm font-medium mb-2 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Terapeutas Verificados
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-outfit text-slate-900 leading-tight">
              Encontre o profissional <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600">
                ideal para você.
              </span>
            </h1>

            <p className="text-lg text-slate-600 font-light max-w-xl">
              Nossa rede conta com profissionais especializados em diversas áreas, prontos para te
              ajudar na sua jornada de autoconhecimento e saúde mental.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <CoreHeartIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Acolhimento
                  </p>
                  <p className="text-sm font-bold text-slate-900">Match por afinidade</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CoreShieldIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Segurança
                  </p>
                  <p className="text-sm font-bold text-slate-900">Perfis verificados</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 hidden md:block"
          >
            <div className="bg-[#FFFAF3] p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-100/20">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Como funciona a busca:</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold shadow-sm border border-orange-100">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Filtre por especialidade</h4>
                    <p className="text-sm text-slate-500 font-light">
                      Escolha o que você deseja tratar: ansiedade, relacionamentos, etc.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold shadow-sm border border-orange-100">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Conheça o perfil</h4>
                    <p className="text-sm text-slate-500 font-light">
                      Veja a biografia, formação e horários disponíveis de cada psicólogo.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold shadow-sm border border-orange-100">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Agende e brilhe</h4>
                    <p className="text-sm text-slate-500 font-light">
                      Marque sua primeira sessão diretamento pela plataforma.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
