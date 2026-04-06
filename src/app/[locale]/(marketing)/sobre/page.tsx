import { Metadata } from 'next'
import Image from 'next/image'
import { Heart, Shield, Video, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'AboutPage' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function SobrePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'AboutPage' })

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold tracking-tight mb-6 animate-fade-in">
              {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 font-heading">
              {t.rich('hero.titlePart1', {})}
              <span className="text-blue-600">{t('hero.titleHighlight')}</span>
              {t.rich('hero.titlePart2', {})}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              {t('hero.description')}
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
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.empathy.title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('values.empathy.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.security.title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('values.security.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.technology.title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('values.technology.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.community.title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('values.community.desc')}
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
              {t('history.title')}
            </h2>
            <p className="text-xl text-slate-600 text-center leading-relaxed font-light italic mb-12">
              {t('history.quote')}
            </p>
            <div className="space-y-8 text-slate-600 font-medium">
              <p>
                {t('history.p1')}
              </p>
              <p>
                {t('history.p2')}
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
                {t('cta.title')}
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/busca"
                  className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  {t('cta.buttonPatient')}
                </Link>
                <Link
                  href="/cadastro?role=psychologist"
                  className="h-14 px-10 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold flex items-center justify-center transition-all backdrop-blur-md active:scale-95"
                >
                  {t('cta.buttonProfessional')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
