import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-12 md:py-16 lg:py-20">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold font-heading">MindCare</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            A plataforma de saúde mental mais completa da América Latina.
                            Conectamos você aos melhores profissionais.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/busca" className="hover:text-foreground">
                                    Buscar Psicólogos
                                </Link>
                            </li>
                            <li>
                                <Link href="/para-empresas" className="hover:text-foreground">
                                    Para Empresas
                                </Link>
                            </li>
                            <li>
                                <Link href="/para-psicologos" className="hover:text-foreground">
                                    Para Psicólogos
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Empresa</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/sobre" className="hover:text-foreground">
                                    Sobre Nós
                                </Link>
                            </li>
                            <li>
                                <Link href="/carreiras" className="hover:text-foreground">
                                    Carreiras
                                </Link>
                            </li>
                            <li>
                                <Link href="/contato" className="hover:text-foreground">
                                    Contato
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/termos" className="hover:text-foreground">
                                    Termos de Uso
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacidade" className="hover:text-foreground">
                                    Política de Privacidade
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} MindCare. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}
