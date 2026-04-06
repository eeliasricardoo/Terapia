import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Award, Building } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function RoleSelection() {
  const t = useTranslations('Auth.roleSelection')
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Link href="/cadastro/paciente" className="block">
        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader>
            <User className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>{t('patient.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('patient.description')}
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/cadastro/profissional" className="block">
        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader>
            <Award className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>{t('professional.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('professional.description')}
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/cadastro/empresa" className="block">
        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader>
            <Building className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>{t('company.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('company.description')}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
