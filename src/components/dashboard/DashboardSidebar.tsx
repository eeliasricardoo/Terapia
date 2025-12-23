"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { useRouter } from "next/navigation"

const MENU_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/sessoes", label: "Sessões", icon: Calendar },
    { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
    { href: "/busca", label: "Buscar Psicólogos", icon: Search },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
]

interface DashboardSidebarProps {
    className?: string
    userData?: {
        name: string
        email: string
        role: string
        avatar: string | null
    }
}

export function DashboardSidebar({ className, userData }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login/paciente")
        router.refresh()
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const roleMap: Record<string, string> = {
        'PATIENT': 'Paciente',
        'PSYCHOLOGIST': 'Psicólogo',
        'COMPANY': 'Empresa',
        'ADMIN': 'Administrador'
    }

    const displayName = userData?.name || 'Usuário'
    const displayRole = userData?.role ? (roleMap[userData.role] || userData.role) : 'Paciente'

    return (
        <aside className={cn("w-full lg:w-64 flex-shrink-0 flex flex-col h-[calc(100vh-2rem)] sticky top-4", className)}>
            {/* User Profile */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={userData?.avatar || undefined} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayRole}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
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
            <div className="mt-auto pt-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 px-4"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </Button>
            </div>
        </aside>
    )
}
