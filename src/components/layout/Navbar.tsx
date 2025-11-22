import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">T</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-primary">
                            Terapia
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        href="/especialistas"
                        className="text-foreground/70 transition-colors hover:text-primary"
                    >
                        Buscar Especialista
                    </Link>
                    <Link
                        href="/para-empresas"
                        className="text-foreground/70 transition-colors hover:text-primary"
                    >
                        Para Empresas
                    </Link>
                    <Link
                        href="/blog"
                        className="text-foreground/70 transition-colors hover:text-primary"
                    >
                        Blog
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary hidden md:block"
                    >
                        Ingresar
                    </Link>
                    <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                        Comenzar Ahora
                    </Button>
                </div>
            </div>
        </header>
    );
}
