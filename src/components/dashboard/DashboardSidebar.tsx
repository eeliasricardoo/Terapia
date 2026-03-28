'use client'
import { logger } from '@/lib/utils/logger'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import { Logo } from '@/components/ui/Logo'

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

interface DashboardSidebarProps {
  className?: string
  initialProfile?: Profile | null
}

export function DashboardSidebar({ className, initialProfile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{
    name: string
    email: string
    role: string
    rawRole: string
    avatar_url?: string
  } | null>(
    initialProfile
      ? {
          name: (initialProfile as any).full_name || (initialProfile as any).fullName || 'Usuário',
          email: '',
          role:
            initialProfile.role === 'ADMIN'
              ? 'Administrador'
              : initialProfile.role === 'PSYCHOLOGIST'
                ? 'Psicólogo'
                : initialProfile.role === 'COMPANY'
                  ? 'Gestor de RH'
                  : 'Paciente',
          rawRole: initialProfile.role,
          avatar_url: initialProfile.avatar_url || (initialProfile as any).avatarUrl || undefined,
        }
      : null
  )
  const [loading, setLoading] = useState(!initialProfile)

  useEffect(() => {
    let channel: any
    async function loadUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (authUser && !initialProfile) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url')
            .eq('user_id', authUser.id)
            .single()

          const metaRole = authUser.user_metadata?.role as string | undefined
          const finalRole =
            profile?.role || (metaRole === 'PSYCHOLOGIST' ? 'PSYCHOLOGIST' : 'PATIENT')
          const displayRole =
            finalRole === 'ADMIN'
              ? 'Administrador'
              : finalRole === 'PSYCHOLOGIST'
                ? 'Psicólogo'
                : finalRole === 'COMPANY'
                  ? 'Gestor de RH'
                  : 'Paciente'

          if (!initialProfile || !user?.name || user.name === 'Usuário') {
            setUser({
              name:
                profile?.full_name ||
                (profile as any)?.fullName ||
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split('@')[0] ||
                'Usuário',
              email: authUser.email || '',
              role: displayRole,
              rawRole: finalRole,
              avatar_url: profile?.avatar_url || (profile as any)?.avatarUrl,
            })
          }

          channel = supabase
            .channel(`sidebar-profile-${authUser.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `user_id=eq.${authUser.id}`,
              },
              (payload) => {
                const newProfile = payload.new as any
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        name: newProfile.full_name || prev.name,
                        avatar_url: newProfile.avatar_url,
                      }
                    : null
                )
              }
            )
            .subscribe()
        }
      } catch (error) {
        logger.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, initialProfile])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  if (loading) {
    return (
      <aside
        className={cn(
          'hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r',
          className
        )}
      >
        <div className="h-16 px-6 border-b flex items-center animate-pulse">
          <div className="h-8 bg-slate-100 w-32 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </aside>
    )
  }

  const isAdmin = user?.rawRole === 'ADMIN'
  const menuItems = isAdmin
    ? ADMIN_MENU
    : user?.rawRole === 'PSYCHOLOGIST'
      ? PSYCHOLOGIST_MENU
      : user?.rawRole === 'COMPANY'
        ? COMPANY_MENU
        : PATIENT_MENU

  return (
    <aside
      className={cn(
        'hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r',
        className
      )}
      role="navigation"
      aria-label="Sentirz"
    >
      <div className="flex flex-col border-b border-slate-100">
        <div className="h-16 px-6 flex items-center border-b border-slate-100/50 bg-slate-50/30">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="flex items-center gap-3 h-20 px-6">
          <Avatar className="h-10 w-10 border border-slate-200">
            <AvatarImage src={user?.avatar_url || '/avatars/user.png'} />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-slate-900 truncate" title={user?.name}>
              {user?.name || 'Carregando...'}
            </p>
            <p className="text-xs text-slate-600 font-medium">{user?.role || ''}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Navegação do dashboard">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive
                    ? 'text-primary-foreground/80'
                    : 'text-slate-500 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors pl-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
