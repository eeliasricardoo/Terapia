'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { BRAND_NAME, BRAND_SLOGAN } from '@/lib/constants/branding'

export function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith('/cadastro')) {
    return null
  }

  return (
    <footer className="border-t border-primary/10 bg-background/50 backdrop-blur-md">
      <div className="container py-16 md:py-20 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6 md:col-span-1 text-left">
            <Logo size="sm" className="mb-4" />
            <p className="text-sm text-foreground/80 leading-relaxed max-w-xs">
              {BRAND_SLOGAN} Conectamos você aos melhores profissionais de saúde mental em um
              ambiente seguro e acolhedor.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              Plataforma
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/busca"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Buscar Psicólogos
                </Link>
              </li>
              <li>
                <Link
                  href="/para-empresas"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Para Empresas
                </Link>
              </li>
              <li>
                <Link
                  href="/para-psicologos"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Para Psicólogos
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              Empresa
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/sobre"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/termos"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/50">
            © {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-foreground/40 font-medium">
            Feito com cuidado para quem sente.
          </p>
        </div>
      </div>
    </footer>
  )
}
