'use client'

import { useState } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
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
  const { isAuthenticated, role, fullName, avatarUrl, signOut } = useAuth()
  const t = useTranslations('Navbar')
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()

  // Use props if provided (prioritize props for overrides), otherwise use auth context
  const isLoggedIn = propIsLoggedIn ?? isAuthenticated
  const userRole = propUserRole ?? role

  const homeHref = isLoggedIn ? '/dashboard' : '/'

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { href: '/busca', label: t('links.search') },
        { href: '/para-empresas', label: t('links.companies') },
        { href: '/para-psicologos', label: t('links.psychologists') },
        { href: '/blog', label: t('links.blog') },
      ]
    }

    switch (userRole) {
      case 'client':
      case 'PATIENT': // Handle database role string
        return [
          { href: '/dashboard', label: t('links.patient.appointments') },
          { href: '/busca', label: t('links.search') },
          { href: '/dashboard/perfil', label: t('links.patient.profile') },
        ]
      case 'psychologist':
      case 'PSYCHOLOGIST':
        return [
          { href: '/agenda', label: t('links.psychologist.schedule') },
          { href: '/pacientes', label: t('links.psychologist.patients') },
          { href: '/financeiro', label: t('links.psychologist.financial') },
          { href: '/perfil', label: t('links.psychologist.profile') },
        ]
      case 'company':
      case 'COMPANY':
        return [
          { href: '/dashboard', label: t('links.company.dashboard') },
          { href: '/colaboradores', label: t('links.company.employees') },
          { href: '/relatorios', label: t('links.company.reports') },
          { href: '/configuracoes', label: t('links.company.settings') },
        ]
      default:
        // Fallback for unknown roles or if role is missing but logged in
        return [
          { href: '/dashboard', label: t('links.company.dashboard') },
          { href: '/busca', label: t('links.search') },
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
              href={homeHref}
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
                  {t('registration.cancel')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('registration.cancelTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('registration.cancelDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('registration.backToRegister')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto mt-2 sm:mt-0 font-bold"
                    onClick={() => router.push(homeHref)}
                  >
                    {t('registration.exitAnyway')}
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
    <header className="sticky top-0 z-50 w-full bg-transparent border-none">
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link href={homeHref} className="flex items-center gap-2.5">
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
            <LanguageSwitcher />
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLoginOpen(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-full px-6 transition-all"
                >
                  {t('buttons.login')}
                </Button>
                <Button
                  onClick={() => setRegisterOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-medium shadow-sm transition-all"
                >
                  {t('buttons.getStarted')}
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
                      <p className="text-sm font-medium leading-none">
                        {fullName || t('menu.user')}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {role === 'PSYCHOLOGIST' ? t('roles.psychologist') : t('roles.patient')}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t('menu.profile')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('menu.settings')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    {t('buttons.logout')}
                  </DropdownMenuItem>
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
                  <div className="flex justify-start mb-2">
                    <LanguageSwitcher />
                  </div>
                  {!isLoggedIn ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLoginOpen(true)}
                      >
                        {t('buttons.login')}
                      </Button>
                      <Button className="w-full" onClick={() => setRegisterOpen(true)}>
                        {t('buttons.getStarted')}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => signOut()}>
                      {t('buttons.logout')}
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
