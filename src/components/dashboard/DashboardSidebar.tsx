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

const MENU_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/sessoes", label: "Sessões", icon: Calendar },
    { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
    { href: "/busca", label: "Buscar Psicólogos", icon: Search },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col h-[calc(100vh-2rem)] sticky top-4">
            {/* User Profile */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback>JP</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm">João Perez</p>
                    <p className="text-xs text-muted-foreground">Paciente</p>
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
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </Button>
            </div>
        </aside>
    )
}
