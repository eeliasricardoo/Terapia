
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function RegistrationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            {/* Minimal Header */}
            <header className="border-b bg-white py-4">
                <div className="container flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight font-heading">
                        T-rapy
                    </Link>
                    <Link href="/login/paciente" className="text-sm font-medium text-blue-600 hover:underline">
                        Já tem uma conta? Entrar
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}
