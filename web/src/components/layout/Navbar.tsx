import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
    isLoggedIn?: boolean;
    userRole?: "client" | "psychologist" | "company";
}

export function Navbar({ isLoggedIn = false, userRole = "client" }: NavbarProps) {
    const getNavLinks = () => {
        if (!isLoggedIn) {
            return [
                { href: "/busca", label: "Buscar Psicólogos" },
                { href: "/para-empresas", label: "Para Empresas" },
                { href: "/para-psicologos", label: "Sou Psicólogo" },
                { href: "/blog", label: "Blog" },
            ];
        }

        switch (userRole) {
            case "client":
                return [
                    { href: "/dashboard", label: "Meus Agendamentos" },
                    { href: "/busca", label: "Buscar Psicólogos" },
                    { href: "/perfil", label: "Meu Perfil" },
                ];
            case "psychologist":
                return [
                    { href: "/agenda", label: "Minha Agenda" },
                    { href: "/pacientes", label: "Pacientes" },
                    { href: "/financeiro", label: "Financeiro" },
                    { href: "/perfil", label: "Meu Perfil" },
                ];
            case "company":
                return [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/colaboradores", label: "Colaboradores" },
                    { href: "/relatorios", label: "Relatórios" },
                    { href: "/configuracoes", label: "Configurações" },
                ];
            default:
                return [];
        }
    };

    const links = getNavLinks();

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
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Entrar</Button>
                                </Link>
                                <Link href="/cadastro">
                                    <Button>Começar Agora</Button>
                                </Link>
                            </>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/01.png" alt="@user" />
                                            <AvatarFallback>
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Usuário</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                usuario@exemplo.com
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Sair</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
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
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-lg font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="flex flex-col gap-2 mt-4">
                                    {!isLoggedIn ? (
                                        <>
                                            <Link href="/login">
                                                <Button variant="outline" className="w-full">
                                                    Entrar
                                                </Button>
                                            </Link>
                                            <Link href="/cadastro">
                                                <Button className="w-full">Começar Agora</Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <Button variant="outline" className="w-full">
                                            Sair
                                        </Button>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
