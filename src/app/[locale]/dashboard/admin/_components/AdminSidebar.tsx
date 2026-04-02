'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AdminSidebar({ profileName }: { profileName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login/paciente')
  }

  const menuItems = [
    { name: 'Visão Geral', href: '/admin-sistema', icon: LayoutDashboard },
    { name: 'Aprovações', href: '/admin-sistema/aprovacoes', icon: UserCheck },
    { name: 'Psicólogos', href: '/admin-sistema/psicologos', icon: Users },
  ]

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full shadow-sm">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Sentirz Admin</h1>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Menu Principal
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {profileName.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-900 truncate">{profileName}</p>
            <p className="text-xs text-neutral-500 truncate">Administrador Master</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-500" />
            Voltar ao App
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  )
}
