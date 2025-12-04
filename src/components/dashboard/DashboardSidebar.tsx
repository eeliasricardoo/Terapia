import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Home,
    Calendar,
    MessageSquare,
    FileText,
    Search,
    TrendingUp
} from "lucide-react"

export function DashboardSidebar() {
    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/avatars/user.png" />
                        <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="font-medium truncate">João Perez</p>
                        <p className="text-xs text-muted-foreground truncate">Plano Premium</p>
                    </div>
                </div>
                <nav className="flex flex-col space-y-1">
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/dashboard">
                            <Home className="mr-2 h-4 w-4" />
                            Visão Geral
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/dashboard/sessoes">
                            <Calendar className="mr-2 h-4 w-4" />
                            Minhas Sessões
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/dashboard/mensagens">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Mensagens
                            <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/30 border-none">2</Badge>
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/dashboard/financeiro">
                            <FileText className="mr-2 h-4 w-4" />
                            Financeiro
                        </Link>
                    </Button>
                </nav>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wider">Descoberta</h3>
                <nav className="flex flex-col space-y-1">
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/busca">
                            <Search className="mr-2 h-4 w-4" />
                            Buscar Psicólogos
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start w-full font-medium hover:bg-slate-100" asChild>
                        <Link href="/blog">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Conteúdos
                        </Link>
                    </Button>
                </nav>
            </div>
        </aside>
    )
}
