'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, User } from 'lucide-react'
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useAuth } from '@/components/providers/auth-provider'

interface NavbarProps {
  isLoggedIn?: boolean
  userRole?: 'client' | 'psychologist' | 'company' | 'PATIENT' | 'PSYCHOLOGIST' | 'COMPANY' | string
}

import { Logo } from '@/components/ui/Logo'

// @ts-ignore
export function Navbar({ isLoggedIn: propIsLoggedIn, userRole: propUserRole }: NavbarProps) {
  const { isAuthenticated, role, fullName, avatarUrl } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()

  // Use props if provided (prioritize props for overrides), otherwise use auth context
  const isLoggedIn = propIsLoggedIn ?? isAuthenticated
  const userRole = propUserRole ?? role

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { href: '/busca', label: 'Buscar Psicólogos' },
        { href: '/para-empresas', label: 'Para Empresas' },
        { href: '/para-psicologos', label: 'Sou Psicólogo' },
        { href: '/blog', label: 'Blog' },
      ]
    }

    switch (userRole) {
      case 'client':
      case 'PATIENT': // Handle database role string
        return [
          { href: '/dashboard', label: 'Meus Agendamentos' },
          { href: '/busca', label: 'Buscar Psicólogos' },
          { href: '/dashboard/perfil', label: 'Meu Perfil' },
        ]
      case 'psychologist':
      case 'PSYCHOLOGIST':
        return [
          { href: '/agenda', label: 'Minha Agenda' },
          { href: '/pacientes', label: 'Pacientes' },
          { href: '/financeiro', label: 'Financeiro' },
          { href: '/perfil', label: 'Meu Perfil' },
        ]
      case 'company':
      case 'COMPANY':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/colaboradores', label: 'Colaboradores' },
          { href: '/relatorios', label: 'Relatórios' },
          { href: '/configuracoes', label: 'Configurações' },
        ]
      default:
        // Fallback for unknown roles or if role is missing but logged in
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/busca', label: 'Buscar Psicólogos' },
        ]
    }
  }

  const links = getNavLinks()

  const isRegistrationFlow = pathname?.startsWith('/cadastro')

  if (isRegistrationFlow) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity"
            >
              <Logo size="sm" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium h-9 px-4"
                >
                  Cancelar Cadastro
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ao prosseguir, você sairá do fluxo de cadastro. Seu progresso pode não ser
                    completamente salvo e você precisará reiniciar as etapas que não foram
                    confirmadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar ao Cadastro</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto mt-2 sm:mt-0 font-bold"
                    onClick={() => router.push('/')}
                  >
                    Sair mesmo assim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2.5">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLoginOpen(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-full px-6 transition-all"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => setRegisterOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-medium shadow-sm transition-all"
                >
                  Começar Agora
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || '/avatars/01.png'} alt="@user" />
                      <AvatarFallback>
                        {fullName ? (
                          fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{fullName || 'Usuário'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {role === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Paciente'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium">
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4">
                  {!isLoggedIn ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLoginOpen(true)}
                      >
                        Entrar
                      </Button>
                      <Button className="w-full" onClick={() => setRegisterOpen(true)}>
                        Começar Agora
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Sair
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <RoleSelectionDialog open={loginOpen} onOpenChange={setLoginOpen} mode="login" />
      <RoleSelectionDialog open={registerOpen} onOpenChange={setRegisterOpen} mode="register" />
    </header>
  )
}
