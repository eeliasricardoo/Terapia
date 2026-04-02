'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 mb-2">
          <span className="text-4xl font-black">500</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Algo deu errado</h1>
          <p className="text-slate-500 font-medium">
            Ocorreu um erro inesperado. Tente novamente ou volte para o início.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full font-bold h-12 rounded-xl border-slate-200 gap-2"
            >
              <Home className="h-4 w-4" />
              Voltar para o Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
