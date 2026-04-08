'use client'
import { logger } from '@/lib/utils/logger'
import { useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
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

import { useTranslations } from 'next-intl'

const PATIENT_MENU = [
  { href: '/dashboard', labelKey: 'menu.patient.dashboard', icon: LayoutGrid },
  { href: '/busca', labelKey: 'menu.patient.search', icon: Search },
  { href: '/dashboard/sessoes', labelKey: 'menu.patient.sessions', icon: Calendar },
  { href: '/dashboard/prontuario', labelKey: 'menu.patient.records', icon: FileText },
  { href: '/dashboard/diario', labelKey: 'menu.patient.journal', icon: BookOpen },
  { href: '/dashboard/mensagens', labelKey: 'menu.patient.messages', icon: MessageSquare },
  { href: '/dashboard/perfil', labelKey: 'menu.patient.profile', icon: User },
]

const PSYCHOLOGIST_MENU = [
  { href: '/dashboard', labelKey: 'menu.psychologist.dashboard', icon: LayoutGrid },
  { href: '/dashboard/agenda', labelKey: 'menu.psychologist.agenda', icon: Calendar },
  { href: '/dashboard/pacientes', labelKey: 'menu.psychologist.patients', icon: Users },
  { href: '/dashboard/mensagens', labelKey: 'menu.psychologist.messages', icon: MessageSquare },
  { href: '/dashboard/configuracoes', labelKey: 'menu.psychologist.config', icon: DollarSign },
  { href: '/dashboard/financeiro', labelKey: 'menu.psychologist.financial', icon: BarChart3 },
  { href: '/dashboard/perfil', labelKey: 'menu.psychologist.profile', icon: User },
  { href: '/dashboard/ajustes', labelKey: 'menu.psychologist.settings', icon: Settings },
]

const ADMIN_MENU = [
  { href: '/dashboard', labelKey: 'menu.admin.dashboard', icon: LayoutGrid },
  { href: '/dashboard/admin/aprovacoes', labelKey: 'menu.admin.approvals', icon: ShieldCheck },
  { href: '/dashboard/admin/psicologos', labelKey: 'menu.admin.psychologists', icon: Users },
  { href: '/dashboard/admin/planos', labelKey: 'menu.admin.plans', icon: HeartPulse },
  { href: '/dashboard/perfil', labelKey: 'menu.admin.profile', icon: User },
]

const COMPANY_MENU = [
  { href: '/dashboard', labelKey: 'menu.company.dashboard', icon: LayoutGrid },
  { href: '/dashboard/empresa/colaboradores', labelKey: 'menu.company.employees', icon: Users },
  { href: '/dashboard/empresa/financeiro', labelKey: 'menu.company.financial', icon: DollarSign },
  { href: '/dashboard/empresa/perfil', labelKey: 'menu.company.profile', icon: Building2 },
  { href: '/dashboard/empresa/suporte', labelKey: 'menu.company.support', icon: LifeBuoy },
  { href: '/dashboard/ajustes', labelKey: 'menu.company.settings', icon: Settings },
]

interface DashboardSidebarProps {
  className?: string
  initialProfile?: Profile | null
}

export function DashboardSidebar({ className, initialProfile }: DashboardSidebarProps) {
  const t = useTranslations('DashboardLayout')
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
          name: initialProfile.full_name || t('roles.user'),
          email: '',
          role:
            initialProfile.role === 'ADMIN'
              ? t('roles.admin')
              : initialProfile.role === 'PSYCHOLOGIST'
                ? t('roles.psychologist')
                : initialProfile.role === 'COMPANY'
                  ? t('roles.companyFull')
                  : t('roles.patient'),
          rawRole: initialProfile.role,
          avatar_url: initialProfile.avatar_url || undefined,
        }
      : null
  )
  const [loading, setLoading] = useState(!initialProfile)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined
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
              ? t('roles.admin')
              : finalRole === 'PSYCHOLOGIST'
                ? t('roles.psychologist')
                : finalRole === 'COMPANY'
                  ? t('roles.companyFull')
                  : t('roles.patient')

          if (
            !initialProfile ||
            !user?.name ||
            user.name === t('roles.user') ||
            user.name === 'Usuário'
          ) {
            setUser({
              name:
                profile?.full_name ||
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split('@')[0] ||
                t('roles.user'),
              email: authUser.email || '',
              role: displayRole,
              rawRole: finalRole,
              avatar_url: profile?.avatar_url || undefined,
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
                const newProfile = payload.new as {
                  full_name: string | null
                  avatar_url: string | null
                }
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        name: newProfile.full_name || prev.name,
                        avatar_url: newProfile.avatar_url ?? undefined,
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
        'hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-primary/10 shadow-sm',
        className
      )}
      role="navigation"
      aria-label="Sentirz"
    >
      <div className="flex flex-col">
        <div className="h-20 px-6 flex items-center border-b border-primary/5 bg-sentirz-teal-pastel/30">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto" aria-label={t('sidebar.navigation')}>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 group mb-1',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-foreground/60 hover:bg-sentirz-teal-pastel hover:text-primary'
              )}
            >
              <item.icon
                className={cn(
                  'h-4.5 w-4.5 transition-colors',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-foreground/40 group-hover:text-primary'
                )}
                aria-hidden="true"
              />
              {/* @ts-ignore */}
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>

      {/* User Session & Logout at Bottom */}
      <div className="p-4 mt-auto border-t border-primary/10 bg-sentirz-teal-pastel/20 space-y-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-primary/5">
            <AvatarImage src={user?.avatar_url || '/avatars/user.png'} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-foreground truncate" title={user?.name}>
              {user?.name || t('sidebar.loading')}
            </p>
            <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
              {user?.role || ''}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-foreground/60 hover:text-destructive hover:bg-destructive/10 font-bold rounded-2xl transition-all pl-4 group"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('sidebar.logout')}
        </Button>
      </div>
    </aside>
  )
}
