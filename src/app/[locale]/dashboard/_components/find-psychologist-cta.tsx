'use client'

import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function FindPsychologistCTA() {
  const t = useTranslations('PatientDashboard.findCta')

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10" aria-hidden="true">
        <Search className="h-64 w-64 text-white" />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">{t('description')}</p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 gap-2 text-base font-semibold px-8 h-12 shadow-sm border-none"
            asChild
          >
            <Link href="/busca">
              <Search className="h-5 w-5" />
              {t('button')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
