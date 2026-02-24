"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/components/providers/auth-provider";

interface NavbarProps {
    isLoggedIn?: boolean;
    userRole?: "client" | "psychologist" | "company" | "PATIENT" | "PSYCHOLOGIST" | "COMPANY" | string;
}

export function Navbar({ isLoggedIn: propIsLoggedIn, userRole: propUserRole }: NavbarProps) {
    const { isAuthenticated, role } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    // Use props if provided (prioritize props for overrides), otherwise use auth context
    const isLoggedIn = propIsLoggedIn ?? isAuthenticated;
    const userRole = propUserRole ?? role;

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
            case "PATIENT": // Handle database role string
                return [
                    { href: "/dashboard", label: "Meus Agendamentos" },
                    { href: "/busca", label: "Buscar Psicólogos" },
                    { href: "/dashboard/perfil", label: "Meu Perfil" },
                ];
            case "psychologist":
            case "PSYCHOLOGIST":
                return [
                    { href: "/agenda", label: "Minha Agenda" },
                    { href: "/pacientes", label: "Pacientes" },
                    { href: "/financeiro", label: "Financeiro" },
                    { href: "/perfil", label: "Meu Perfil" },
                ];
            case "company":
            case "COMPANY":
                return [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/colaboradores", label: "Colaboradores" },
                    { href: "/relatorios", label: "Relatórios" },
                    { href: "/configuracoes", label: "Configurações" },
                ];
            default:
                // Fallback for unknown roles or if role is missing but logged in
                return [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/busca", label: "Buscar Psicólogos" },
                ];
        }
    };

    const links = getNavLinks();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight font-heading">
                            MindCare
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
                                <Button variant="ghost" onClick={() => setLoginOpen(true)}>
                                    Entrar
                                </Button>
                                <Button onClick={() => setRegisterOpen(true)}>
                                    Começar Agora
                                </Button>
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
                                            <Button variant="outline" className="w-full" onClick={() => setLoginOpen(true)}>
                                                Entrar
                                            </Button>
                                            <Button className="w-full" onClick={() => setRegisterOpen(true)}>
                                                Começar Agora
                                            </Button>
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

            <RoleSelectionDialog
                open={loginOpen}
                onOpenChange={setLoginOpen}
                mode="login"
            />
            <RoleSelectionDialog
                open={registerOpen}
                onOpenChange={setRegisterOpen}
                mode="register"
            />
        </header>
    );
}
