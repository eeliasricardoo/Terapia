'use client'

import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function FindPsychologistCTA() {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10" aria-hidden="true">
        <Search className="h-64 w-64 text-white" />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Encontre o profissional ideal para você</h2>
          <p className="text-blue-50 text-lg mb-8">
            Nossa plataforma conta com especialistas em diversas áreas prontos para te ajudar.
            Comece sua jornada de autoconhecimento hoje mesmo.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-blue-600 hover:bg-white/90 gap-2 text-base font-semibold px-8 h-12"
            asChild
          >
            <Link href="/busca">
              <Search className="h-5 w-5" />
              Buscar Psicólogos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
