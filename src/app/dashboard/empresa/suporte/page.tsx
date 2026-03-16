'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

const FAQS = [
  {
    q: 'Como adiciono novos colaboradores?',
    a: 'Você pode adicionar novos colaboradores através do menu "Colaboradores" clicando no botão "Novo Vínculo".',
  },
  {
    q: 'Como funciona o faturamento?',
    a: 'O faturamento é mensal e baseado no número de colaboradores com benefício ativo na plataforma.',
  },
  {
    q: 'Posso limitar o número de sessões?',
    a: 'Sim, nas configurações de perfil da empresa você pode definir o subsídio e o limite de sessões por mês.',
  },
]

export default function CompanySupportPage() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999', '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit mb-4">
          Como podemos ajudar?
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Estamos aqui para garantir que sua empresa e seus colaboradores tenham a melhor
          experiência possível com a Terapia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="rounded-3xl border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all group">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Fale com um consultor agora mesmo para suporte em tempo real.
            </p>
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-12 font-bold gap-2 shadow-lg shadow-emerald-600/20"
            >
              Iniciar Conversa
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all group">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">E-mail</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Envie suas dúvidas e nossa equipe responderá em até 24h.
            </p>
            <Button
              variant="outline"
              className="w-full border-blue-100 text-blue-600 hover:bg-blue-50 rounded-xl h-12 font-bold gap-2"
            >
              contato@terapia.com
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all group">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Telefone</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Atendimento telefônico de Segunda a Sexta, das 09:00 às 18:00.
            </p>
            <Button
              variant="outline"
              className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl h-12 font-bold gap-2"
            >
              0800 777 0000
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Perguntas Frequentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FAQS.map((faq, i) => (
              <div key={i} className="space-y-3">
                <h4 className="font-bold text-slate-900 text-lg flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
