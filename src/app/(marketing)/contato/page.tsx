import { Metadata } from 'next'
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Contato | Terapia',
  description: 'Entre em contato com a equipe da Terapia para suporte ou dúvidas.',
}

export default function ContatoPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Informações de Contato */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                Fale Conosco
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 font-heading">
                Estamos aqui para <span className="text-blue-600">te ouvir.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                Tem alguma dúvida, sugestão ou precisa de suporte técnico? Preencha o formulário ou
                use um de nossos canais.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">E-mail</h3>
                  <a
                    href="mailto:ajuda@terapiaplataforma.com.br"
                    className="text-slate-500 hover:text-blue-600 font-medium text-sm md:text-base"
                  >
                    ajuda@terapiaplataforma.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">WhatsApp Suporte</h3>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-green-600 font-medium text-sm md:text-base"
                  >
                    (11) 98765-4321
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Localização</h3>
                  <p className="text-slate-500 font-medium text-sm md:text-base">
                    Rua Digital, 123 - São Paulo, SP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">
                      Nome Completo
                    </label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700 ml-1">
                    Assunto
                  </label>
                  <Input
                    id="subject"
                    placeholder="Como podemos ajudar?"
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 ml-1">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Escreva sua mensagem aqui..."
                    className="min-h-[160px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none p-4"
                  />
                </div>

                <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-lg shadow-xl shadow-slate-900/20 group transition-all active:scale-95">
                  <span className="flex items-center gap-2">
                    Enviar Mensagem
                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </Button>

                <p className="text-center text-xs text-slate-400 font-medium">
                  Respondemos em até 24 horas úteis. Ao enviar, você concorda com nossa Política de
                  Privacidade.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
