import { RoleSelection } from '@/components/auth/RoleSelection'
import { getTranslations } from 'next-intl/server'

export default async function RegistrationPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Auth.register' })

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('howToCreate')}</h1>
        <p className="text-muted-foreground">{t('selectOption')}</p>
      </div>
      <RoleSelection />
    </div>
  )
}
