"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

const PATIENT_MENU = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/busca", label: "Buscar Psicólogos", icon: Search },
    { href: "/dashboard/sessoes", label: "Minhas Sessões", icon: Calendar },
    { href: "/dashboard/diario", label: "Diário Emocional", icon: BookOpen },
    { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
]


const PSYCHOLOGIST_MENU = [
    { href: "/dashboard", label: "Visão Geral", icon: LayoutGrid },
    { href: "/dashboard/agenda", label: "Minha Agenda", icon: Calendar },
    { href: "/dashboard/pacientes", label: "Meus Pacientes", icon: Users },
    { href: "/dashboard/configuracoes", label: "Serviços & Tarifas", icon: DollarSign },
    { href: "/dashboard/financeiro", label: "Financeiro", icon: BarChart3 },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
    { href: "/dashboard/ajustes", label: "Ajustes", icon: Settings },
]

interface DashboardSidebarProps {
    className?: string
    initialProfile?: Profile | null
}

export function DashboardSidebar({ className, initialProfile }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Set initial state from server-fetched profile to avoid CSR loading flash
    const [user, setUser] = useState<{ name: string; email: string; role: string; rawRole: string; avatar_url?: string } | null>(
        initialProfile ? {
            name: initialProfile.full_name || 'Usuário',
            email: '', // Not strictly needed for UI, but keeping for compatibility
            role: initialProfile.role === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Paciente',
            rawRole: initialProfile.role,
            avatar_url: initialProfile.avatar_url || undefined
        } : null
    )
    const [loading, setLoading] = useState(!initialProfile)

    useEffect(() => {
        let channel: any;

        async function loadUser() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (authUser && !initialProfile) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, role, avatar_url')
                        .eq('user_id', authUser.id)
                        .single()

                    const metaRole = authUser.user_metadata?.role as string | undefined
                    const finalRole = profile?.role || (metaRole === 'PSYCHOLOGIST' ? 'PSYCHOLOGIST' : 'PATIENT')

                    if (!initialProfile) {
                        setUser({
                            name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
                            email: authUser.email || '',
                            role: finalRole === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Paciente',
                            rawRole: finalRole,
                            avatar_url: profile?.avatar_url
                        })
                    }

                    // Realtime subscription
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
                                setUser((prev) => {
                                    if (!prev) return null
                                    return {
                                        ...prev,
                                        name: newProfile.full_name || prev.name,
                                        avatar_url: newProfile.avatar_url
                                    }
                                })
                            }
                        )
                        .subscribe()
                }
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [supabase])

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/")
    }

    if (loading) {
        return (
            <aside className={cn("hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r", className)}>
                <div className="h-20 px-6 border-b flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </aside>
        )
    }

    const menuItems = user?.rawRole === 'PSYCHOLOGIST' ? PSYCHOLOGIST_MENU : PATIENT_MENU

    return (
        <aside className={cn("hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r", className)}>
            {/* User Profile */}
            <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-100">
                <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage src={user?.avatar_url || "/avatars/user.png"} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                        {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm text-slate-900 truncate" title={user?.name}>{user?.name || 'Carregando...'}</p>
                    <p className="text-xs text-slate-500 font-medium">{user?.role || ''}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
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
