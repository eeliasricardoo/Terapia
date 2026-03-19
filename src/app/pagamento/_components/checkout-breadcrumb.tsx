import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

export function CheckoutBreadcrumb() {
  const breadcrumbs = [
    { name: 'Início', href: '/', current: false },
    { name: 'Buscar Psicólogos', href: '/busca', current: false },
    { name: 'Perfil do Profissional', href: '#', current: false },
    { name: 'Finalizar Pagamento', href: '#', current: true },
  ]

  return (
    <nav className="flex mb-10" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-1 sm:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={item.name}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mx-1 sm:mx-2" />
              )}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">{item.name}</span>
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-blue-600 cursor-default'
                      : 'text-slate-500 hover:text-blue-600'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
