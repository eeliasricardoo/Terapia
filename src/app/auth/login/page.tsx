import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Command } from "lucide-react"

export const metadata: Metadata = {
    title: "Entrar | Terapia",
    description: "Acesse sua conta para continuar sua jornada de bem-estar.",
}

export default function LoginPage() {
    return (
        <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/auth/register"
                className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                Não tem uma conta? Cadastre-se
            </Link>

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-blue-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Command className="mr-2 h-6 w-6" />
                    Terapia
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;O autoconhecimento é o começo de toda sabedoria. Estamos aqui para te apoiar em cada passo.&rdquo;
                        </p>
                        <footer className="text-sm">Equipe Terapia</footer>
                    </blockquote>
                </div>
            </div>

            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Digite seu email para acessar sua conta
                        </p>
                    </div>
                    <LoginForm />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Ao clicar em continuar, você concorda com nossos{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Termos de Serviço
                        </Link>{" "}
                        e{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Política de Privacidade
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
