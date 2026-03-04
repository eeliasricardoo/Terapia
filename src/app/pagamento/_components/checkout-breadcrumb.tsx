'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function CheckoutBreadcrumb() {
  return (
    <div className="mb-8">
      <div className="flex items-center text-sm text-slate-500 gap-2">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/busca" className="hover:text-blue-600 transition-colors">
          Buscar Psicólogos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700 font-medium">Pagamento</span>
      </div>
    </div>
  )
}
