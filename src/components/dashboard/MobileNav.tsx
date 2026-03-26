'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  LayoutGrid,
  Calendar,
  MessageSquare,
  Search,
  User,
  LogOut,
  Users,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PATIENT_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/busca', label: 'Buscar Psicólogos', icon: Search },
  { href: '/dashboard/sessoes', label: 'Minhas Sessões', icon: Calendar },
  { href: '/dashboard/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/dashboard/configuracoes', label: 'Serviços & Tarifas', icon: DollarSign },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

const PSYCHOLOGIST_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/agenda', label: 'Minha Agenda', icon: Calendar },
  { href: '/dashboard/pacientes', label: 'Meus Pacientes', icon: Users },
  { href: '/dashboard/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

const ADMIN_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/admin/aprovacoes', label: 'Aprovações', icon: LayoutGrid },
  { href: '/dashboard/admin/psicologos', label: 'Psicólogos', icon: Users },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

const COMPANY_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/empresa/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/dashboard/empresa/perfil', label: 'Perfil', icon: User },
]

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ name: string; role: string; rawRole: string } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', authUser.id)
          .single()

        const finalRole = profile?.role || 'PATIENT'
        setUser({
          name: profile?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          role:
            finalRole === 'ADMIN'
              ? 'Administrador'
              : finalRole === 'PSYCHOLOGIST'
                ? 'Psicólogo'
                : finalRole === 'COMPANY'
                  ? 'Gestor'
                  : 'Paciente',
          rawRole: finalRole,
        })
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const menuItems =
    user?.rawRole === 'ADMIN'
      ? ADMIN_MENU
      : user?.rawRole === 'PSYCHOLOGIST'
        ? PSYCHOLOGIST_MENU
        : user?.rawRole === 'COMPANY'
          ? COMPANY_MENU
          : PATIENT_MENU

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-50 shadow-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
      >
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">
          T
        </div>
        <span className="text-slate-900">Terapia</span>
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(85vw,20rem)] p-0">
          <div className="h-full flex flex-col p-6">
            {/* Profile Info */}
            <div className="flex items-center gap-3 mb-8">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/user.png" />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user?.name || 'Carregando...'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || ''}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-colors',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon
                      className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-slate-500')}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 px-4"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
