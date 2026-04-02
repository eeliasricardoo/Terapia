'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Pode logar o erro em um serviço de observabilidade (ex: Sentry) no futuro se necessário
    console.error('Dashboard Error boundary caught an error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Ops! Algo deu errado.</CardTitle>
          <CardDescription>
            Tivemos um problema inesperado ao carregar esta página. Não se preocupe, seus dados
            estão seguros.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center mt-4">
          <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border overflow-x-auto text-left opacity-70">
            {error.message || 'Erro de conexão ou renderização.'}
          </div>

          <Button onClick={() => reset()} className="w-full gap-2 mt-2" size="lg">
            <RotateCcw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
