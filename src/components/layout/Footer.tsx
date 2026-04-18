'use client'

import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { BRAND_NAME, BRAND_SLOGAN } from '@/lib/constants/branding'

import { useAuth } from '@/components/providers/auth-provider'

export function Footer() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const t = useTranslations('Footer')

  const homeHref = isAuthenticated ? '/dashboard' : '/'

  if (pathname?.startsWith('/cadastro')) {
    return null
  }

  return (
    <footer className="border-t border-primary/10 bg-background/50 backdrop-blur-md">
      <div className="container py-16 md:py-20 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6 md:col-span-1 text-left">
            <Link href={homeHref} className="block transition-all hover:opacity-80">
              <Logo size="sm" className="mb-4" />
            </Link>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-xs">
              {BRAND_SLOGAN} {t('description')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              {t('categories.platform')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/busca"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.search')}
                </Link>
              </li>
              <li>
                <Link
                  href="/para-empresas"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.companies')}
                </Link>
              </li>
              <li>
                <Link
                  href="/para-psicologos"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.psychologists')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              {t('categories.company')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/sobre"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              {t('categories.legal')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/termos"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  {t('links.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/50">
            © {new Date().getFullYear()} {BRAND_NAME}. {t('rights')}
          </p>
          <p className="text-xs text-foreground/40 font-medium">{t('madeWithCare')}</p>
        </div>
      </div>
    </footer>
  )
}
