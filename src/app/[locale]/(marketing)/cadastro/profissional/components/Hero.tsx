import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('Auth.professionalRegistration')
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight">{t('hero.title')}</h1>
      <p className="text-muted-foreground">{t('hero.description')}</p>
    </div>
  )
}
