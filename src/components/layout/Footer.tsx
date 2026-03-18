'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/cadastro')) {
    return null
  }

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container py-16 md:py-20 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-bold font-heading text-slate-900">Terapia</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Conectamos você aos melhores profissionais de saúde mental.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Plataforma
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/busca"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Buscar Psicólogos
                </Link>
              </li>
              <li>
                <Link
                  href="/para-empresas"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Para Empresas
                </Link>
              </li>
              <li>
                <Link
                  href="/para-psicologos"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Para Psicólogos
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Empresa
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/sobre"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/termos"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Terapia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-300">Feito com cuidado para quem cuida.</p>
        </div>
      </div>
    </footer>
  )
}
