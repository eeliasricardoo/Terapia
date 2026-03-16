'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export function BlogGrid() {
  const posts = [
    {
      title: '5 sinais de que é hora de procurar terapia',
      excerpt:
        'Identificar o momento certo para pedir ajuda pode ser o primeiro passo para uma vida mais leve.',
      category: 'Autoestima',
      date: '10 Mar 2024',
      readTime: '5 min',
      image:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Como lidar com a ansiedade no ambiente de trabalho',
      excerpt: 'Dicas práticas para manter o equilíbrio emocional mesmo em dias de alta pressão.',
      category: 'Carreira',
      date: '08 Mar 2024',
      readTime: '7 min',
      image:
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'A importância do sono para a saúde mental',
      excerpt: 'Entenda como as noites mal dormidas afetam seu humor e suas funções cognitivas.',
      category: 'Saúde',
      date: '05 Mar 2024',
      readTime: '4 min',
      image: '/blog-sleep.png',
    },
  ]

  return (
    <section className="w-full py-20 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl font-outfit">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-purple-600 uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-500 font-light mb-8 line-clamp-3">{post.excerpt}</p>

                <div className="mt-auto">
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-900 group/btn">
                    Ler artigo completo
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
