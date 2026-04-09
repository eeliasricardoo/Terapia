'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useTransition } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: 'pt' | 'es') => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange('pt')} disabled={locale === 'pt'}>
          Português
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange('es')} disabled={locale === 'es'}>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
