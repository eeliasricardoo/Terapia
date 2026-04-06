import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-sentirz-teal-pastel text-primary mb-2">
          <span className="text-4xl font-black">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-slate-500 font-medium">
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>

        <Link href="/" className="block">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20 gap-2">
            <Home className="h-4 w-4" />
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  )
}
