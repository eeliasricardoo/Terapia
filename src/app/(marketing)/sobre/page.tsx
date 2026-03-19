import { Metadata } from 'next'
import Image from 'next/image'
import { Heart, Shield, Video, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nós | Terapia',
  description: 'Conheça a missão e a equipe por trás da plataforma Terapia.',
}

export default function SobrePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold tracking-tight mb-6 animate-fade-in">
              Nossa Missão
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 font-heading">
              Saúde Mental <span className="text-blue-600">Acessível</span> para Todos
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Acreditamos que cuidar da mente não deve ser um privilégio, mas um direito. A Terapia
              nasceu para encurtar distâncias e quebrar estigmas.
            </p>
          </div>

          <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900/20 mix-blend-multiply"></div>
            <Image
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=2000"
              alt="Apoio e Cuidado"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Empatia</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Colocamos o ser humano no centro de tudo o que fazemos, com escuta ativa e
                acolhimento.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sigilo absoluto e criptografia de ponta para garantir sua total privacidade.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tecnologia</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Inovamos constantemente para oferecer a melhor experiência de atendimento remoto.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Comunidade</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Criamos laços entre profissionais e pacientes para uma jornada de evolução conjunta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* História */}
      <section className="py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-4xl font-extrabold text-slate-900 text-center mb-12">
              Nossa História
            </h2>
            <p className="text-xl text-slate-600 text-center leading-relaxed font-light italic mb-12">
              &quot;A Terapia nasceu de uma conversa em 2024 sobre como era difícil encontrar ajuda
              qualificada de forma rápida e segura. Decidimos criar a plataforma que gostaríamos de
              usar.&quot;
            </p>
            <div className="space-y-8 text-slate-600 font-medium">
              <p>
                Iniciamos nossa jornada com um pequeno grupo de psicólogos visionários que
                acreditavam no potencial da telepsicologia. Hoje, somos centenas de profissionais
                cuidando de milhares de vidas em todo o país.
              </p>
              <p>
                Nossa plataforma não é apenas um software de vídeo; é um ecossistema completo que
                apoia o profissional em sua gestão clínica e garante ao paciente um ambiente seguro
                para florescer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-20"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Pronto para começar sua jornada?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
                Encontre o psicólogo ideal para você em poucos minutos e comece a cuidar do que mais
                importa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/busca"
                  className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Encontrar Terapeuta
                </a>
                <a
                  href="/cadastro/profissional"
                  className="h-14 px-10 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold flex items-center justify-center transition-all backdrop-blur-md active:scale-95"
                >
                  Sou Psicólogo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
