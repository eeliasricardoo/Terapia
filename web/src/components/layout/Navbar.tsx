import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight font-heading">
                            T-rapy
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/busca"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Buscar Psicólogos
                        </Link>
                        <Link
                            href="/para-empresas"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Para Empresas
                        </Link>
                        <Link
                            href="/para-psicologos"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Sou Psicólogo
                        </Link>
                        <Link
                            href="/blog"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Blog
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link href="/cadastro">
                            <Button>Começar Agora</Button>
                        </Link>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <nav className="flex flex-col gap-4 mt-8">
                                <Link href="/busca" className="text-lg font-medium">
                                    Buscar Psicólogos
                                </Link>
                                <Link href="/para-empresas" className="text-lg font-medium">
                                    Para Empresas
                                </Link>
                                <Link href="/para-psicologos" className="text-lg font-medium">
                                    Sou Psicólogo
                                </Link>
                                <Link href="/blog" className="text-lg font-medium">
                                    Blog
                                </Link>
                                <div className="flex flex-col gap-2 mt-4">
                                    <Link href="/login">
                                        <Button variant="outline" className="w-full">
                                            Entrar
                                        </Button>
                                    </Link>
                                    <Link href="/cadastro">
                                        <Button className="w-full">Começar Agora</Button>
                                    </Link>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
