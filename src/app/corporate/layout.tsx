import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CorporateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const NavItems = () => (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
                href="/corporate"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
            <Link
                href="/corporate/colaboradores"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
                <Users className="h-4 w-4" />
                Colaboradores
            </Link>
            <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
                <CreditCard className="h-4 w-4" />
                Financeiro
            </Link>
            <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
                <Settings className="h-4 w-4" />
                Configurações
            </Link>
        </nav>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-xs">T</span>
                            </div>
                            <span className="">Terapia Corp</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <NavItems />
                    </div>
                    <div className="mt-auto p-4">
                        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>HR</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Ana HR</span>
                                <span className="text-xs text-muted-foreground">Google Inc.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <span className="sr-only">Terapia Corp</span>
                                </Link>
                                <NavItems />
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Search or Breadcrumbs could go here */}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Sair</span>
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
