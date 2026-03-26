'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  Mail,
  HelpCircle,
  ArrowLeft,
  HeadphonesIcon,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SuportePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors gap-1 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Dashboard
      </Link>

      <div className="text-center space-y-4 py-6">
        <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground mx-auto shadow-xl shadow-primary/20 mb-6">
          <HeadphonesIcon className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900">Como podemos ajudar?</h1>
        <p className="text-slate-600 max-w-xl mx-auto text-lg font-medium">
          Nossa equipe de suporte está pronta para te auxiliar com qualquer dúvida técnica ou
          administrativa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white group cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Chat via WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-1 italic">Seg à Sex, 09h às 18h</p>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl" asChild>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                Falar agora
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white group cursor-pointer border-t-2 border-primary">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">E-mail de Suporte</h3>
              <p className="text-xs text-slate-500 mt-1 italic">Resposta em até 24h</p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl" asChild>
              <a href="mailto:suporte@terapia.com">Enviar E-mail</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white group cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Central de Ajuda</h3>
              <p className="text-xs text-slate-500 mt-1 italic">Tutoriais e FAQs</p>
            </div>
            <Button variant="outline" className="w-full rounded-xl border-slate-200" asChild>
              <Link href="#">
                Acessar Wiki <ExternalLink className="h-3 w-3 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-primary p-8 rounded-3xl text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Emergência de Saúde Mental?</h2>
            <p className="text-slate-400">
              Se você está em uma crise imediata, por favor, entre em contato com o **CVV (Centro de
              Valorização da Vida)** pelo número **188** (disponível 24h).
            </p>
          </div>
          <Button
            variant="outline"
            className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 shrink-0"
            asChild
          >
            <a href="https://cvv.org.br" target="_blank" rel="noopener noreferrer">
              Acessar CVV
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
