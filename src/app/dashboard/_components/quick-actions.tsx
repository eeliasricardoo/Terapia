'use client'

import { FileText, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-6">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Diário Emocional</h3>
          <p className="text-sm text-slate-500 mb-4">Escreva sobre seus sentimentos</p>
          <Button
            asChild
            variant="secondary"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-full justify-start group-hover:pl-4 transition-all"
          >
            <Link href="/dashboard/diario">
              Abrir Diário{' '}
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <h3 className="font-semibold text-white mb-1">Precisa de ajuda agora?</h3>
            <p className="text-sm text-slate-300">
              Acesse nossos conteúdos de bem-estar ou fale com o suporte.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/10 text-sm font-medium px-2"
            >
              <Link href="/dashboard/bem-estar">Conteúdos</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-blue-300 hover:text-blue-200 hover:bg-white/5 text-sm font-medium px-2 ml-auto"
            >
              <Link href="/dashboard/suporte">Suporte</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
