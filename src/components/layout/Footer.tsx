import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
                            Terapia
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Salud mental accesible y de calidad para todos los hispanohablantes.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Plataforma</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/especialistas" className="hover:text-foreground">
                                    Buscar Especialista
                                </Link>
                            </li>
                            <li>
                                <Link href="/para-empresas" className="hover:text-foreground">
                                    Para Empresas
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Empresa</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/sobre" className="hover:text-foreground">
                                    Sobre Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link href="/carreiras" className="hover:text-foreground">
                                    Carreras
                                </Link>
                            </li>
                            <li>
                                <Link href="/contato" className="hover:text-foreground">
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Legal</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/privacidade" className="hover:text-foreground">
                                    Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="/termos" className="hover:text-foreground">
                                    Términos de Uso
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Terapia. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
