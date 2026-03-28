'use client'

import { motion, Variants } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useState } from 'react'

const fadeIn: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
}

const faqs = [
  {
    question: 'Como saber qual psicólogo é ideal para mim?',
    answer:
      'Na nossa plataforma, você pode filtrar profissionais por especialidade e abordagem. Recomendamos ler o perfil e a biografia de cada um para sentir com qual você mais se identifica. Se não sentir conexão na primeira sessão, você pode tentar com outro profissional sem complicações.',
  },
  {
    question: 'A terapia online é tão eficaz quanto a presencial?',
    answer:
      'Sim, diversos estudos comprovam que a terapia online tem a mesma eficácia que a presencial para a grande maioria dos casos. Ela oferece a vantagem de ser feita no conforto do seu ambiente seguro, eliminando o estresse do deslocamento.',
  },
  {
    question: 'Minhas sessões são realmente sigilosas?',
    answer:
      'Com certeza. O sigilo é um pilar fundamental da psicologia e nossa plataforma utiliza criptografia de ponta a ponta. Suas conversas e dados estão totalmente protegidos e não são gravados.',
  },
  {
    question: 'Como funciona o pagamento das sessões?',
    answer:
      'O pagamento é feito de forma simples e segura diretamente pela plataforma via cartão de crédito ou PIX, antes da sessão começar. Você também pode contratar pacotes mensais com desconto.',
  },
  {
    question: 'E se eu precisar desmarcar uma sessão?',
    answer:
      'Você pode reagendar ou cancelar sua sessão diretamente pelo dashboard com até 24 horas de antecedência sem custo adicional.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-white relative overflow-hidden">
      <div className="container px-4 sm:px-6 relative z-10 mx-auto max-w-3xl">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-16"
        >
          {/* Section header */}
          <div className="text-center space-y-5">
            <motion.p
              variants={fadeIn}
              className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]"
            >
              Dúvidas frequentes
            </motion.p>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-outfit"
            >
              Tire suas dúvidas
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed"
            >
              Tudo o que você precisa saber para começar sua jornada com segurança.
            </motion.p>
          </div>

          {/* FAQ Items */}
          <motion.div variants={stagger} className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-3 sm:pr-8">{faq.question}</span>
                  <div className="flex-shrink-0 text-slate-400">
                    {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === i ? 'auto' : 0,
                    opacity: openIndex === i ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-slate-500 leading-relaxed border-t border-slate-50/50">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeIn} className="text-center pt-8">
            <p className="text-slate-400 text-sm">
              Ainda tem dúvidas?{' '}
              <Link href="/contato" className="text-blue-600 font-semibold hover:underline">
                Fale conosco
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

import Link from 'next/link'
