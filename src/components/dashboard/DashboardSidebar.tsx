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
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const MENU_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/busca", label: "Buscar Psicólogos", icon: Search },
    { href: "/dashboard/sessoes", label: "Sessões", icon: Calendar },
    { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
]

interface DashboardSidebarProps {
    className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

    useEffect(() => {
        async function loadUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('user_id', authUser.id)
                    .single()

                setUser({
                    name: profile?.full_name || authUser.email?.split('@')[0] || 'Usuário',
                    email: authUser.email || '',
                    role: profile?.role === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Paciente'
                })
            }
        }
        loadUser()
    }, [supabase])

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/")
    }

    return (
        <aside className={cn("hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r", className)}>
            {/* User Profile */}
            <div className="flex items-center gap-3 h-16 px-6 border-b">
                <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm">{user?.name || 'Carregando...'}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || ''}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="pt-4 pb-4 px-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </Button>
            </div>
        </aside>
    )
}
