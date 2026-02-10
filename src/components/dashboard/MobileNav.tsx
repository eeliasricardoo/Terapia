"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutGrid, Calendar, MessageSquare, Search, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const MENU_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/busca", label: "Buscar Psicólogos", icon: Search },
    { href: "/dashboard/sessoes", label: "Sessões", icon: Calendar },
    { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageSquare },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
]

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function MobileNav() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/")
    }

    return (
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
            <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    T
                </div>
                Terapia
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                    <div className="h-full flex flex-col p-6">
                        {/* Profile Info */}
                        <div className="flex items-center gap-3 mb-8">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src="/avatars/user.png" />
                                <AvatarFallback>JP</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">João Perez</p>
                                <p className="text-xs text-muted-foreground">Paciente</p>
                            </div>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex-1 space-y-2">
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

                        <div className="pt-4">
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
