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
  Settings,
  BarChart3,
  BookOpen,
  FileText,
  ShieldCheck,
  Building2,
  LifeBuoy,
  HeartPulse,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PATIENT_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/busca', label: 'Buscar Psicólogos', icon: Search },
  { href: '/dashboard/sessoes', label: 'Minhas Sessões', icon: Calendar },
  { href: '/dashboard/prontuario', label: 'Meu Prontuário', icon: FileText },
  { href: '/dashboard/diario', label: 'Diário Emocional', icon: BookOpen },
  { href: '/dashboard/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

const PSYCHOLOGIST_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/agenda', label: 'Minha Agenda', icon: Calendar },
  { href: '/dashboard/pacientes', label: 'Meus Pacientes', icon: Users },
  { href: '/dashboard/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/dashboard/configuracoes', label: 'Serviços & Tarifas', icon: DollarSign },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: BarChart3 },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
  { href: '/dashboard/ajustes', label: 'Ajustes', icon: Settings },
]

const ADMIN_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/admin/aprovacoes', label: 'Aprovações', icon: ShieldCheck },
  { href: '/dashboard/admin/psicologos', label: 'Psicólogos', icon: Users },
  { href: '/dashboard/admin/planos', label: 'Planos de Saúde', icon: HeartPulse },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

const COMPANY_MENU = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { href: '/dashboard/empresa/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/dashboard/empresa/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/empresa/perfil', label: 'Perfil da Empresa', icon: Building2 },
  { href: '/dashboard/empresa/suporte', label: 'Suporte', icon: LifeBuoy },
  { href: '/dashboard/ajustes', label: 'Configurações', icon: Settings },
]

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{
    name: string
    role: string
    rawRole: string
    email: string
    avatarUrl: string | null
  } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('user_id', authUser.id)
          .single()

        const finalRole = profile?.role || 'PATIENT'
        setUser({
          name: profile?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          avatarUrl: profile?.avatar_url || null,
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

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-50">
      {/* Left: wordmark only — no logo icon */}
      <Link href="/dashboard" className="flex items-center">
        <span className="text-lg font-black tracking-tight text-slate-900">Sentirz</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-100"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[min(85vw,20rem)] p-0 border-r border-slate-100 bg-white flex flex-col"
        >
          {/* Hero header */}
          <div className="relative overflow-hidden px-5 pt-8 pb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            {/* decorative orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-14 w-14 ring-2 ring-white/20">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} className="object-cover" />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-base truncate leading-tight">
                  {user?.name || 'Carregando...'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {user?.role || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isActive ? 'bg-white/15' : 'bg-slate-100 group-hover:bg-slate-200'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/50 shrink-0" />}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 pb-5 pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 group"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
              </div>
              Sair da conta
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
