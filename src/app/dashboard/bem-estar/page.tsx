'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayCircle, BookOpen, Music, Heart, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const CONTENTS = [
  {
    title: 'Meditação Guiada: Alívio de Ansiedade',
    description: 'Uma sessão de 10 minutos para acalmar a mente e focar no presente.',
    type: 'Vídeo',
    duration: '10 min',
    icon: PlayCircle,
    color: 'bg-blue-500',
  },
  {
    title: 'A Arte do Autoconhecimento',
    description: 'Entenda como pequenos hábitos podem transformar sua saúde mental.',
    type: 'Leitura',
    duration: '5 min',
    icon: BookOpen,
    color: 'bg-emerald-500',
  },
  {
    title: 'Sons Relaxantes: Natureza',
    description: 'Áudios imersivos para foco no trabalho ou relaxamento antes de dormir.',
    type: 'Áudio',
    duration: 'Infinito',
    icon: Music,
    color: 'bg-indigo-500',
  },
  {
    title: 'Exercício de Respiração (4-7-8)',
    description: 'Técnica comprovada para controle de pânico e estresse agudo.',
    type: 'Interativo',
    duration: '2 min',
    icon: Heart,
    color: 'bg-rose-500',
  },
]

export default function BemEstarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors gap-1 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Dashboard
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Bem-estar & Equilíbrio
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Conteúdos de Bem-estar
        </h1>
        <p className="text-slate-600 max-w-2xl text-lg">
          Uma seleção curada por especialistas para te apoiar nos momentos entre suas sessões de
          terapia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {CONTENTS.map((content, index) => (
          <motion.div
            key={content.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer h-full bg-white">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div
                    className={`h-12 w-12 rounded-2xl ${content.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <content.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {content.type}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {content.duration}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {content.title}
                    </CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {content.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">
                    Acessar agora
                  </span>
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm">
                    &rarr;
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
