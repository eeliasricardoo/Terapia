"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Hero } from "./Hero"
import { PasswordInput } from "./PasswordInput"
import { DividerWithText } from "./DividerWithText"
import { SocialLoginButtons } from "./SocialLoginButtons"
import { professionalRegistrationSchema, type ProfessionalRegistrationInput } from "@/lib/validations/professional-registration"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { maskCRP } from "@/lib/utils/crp"
import { auth } from "@/lib/supabase/auth"

export function RegistrationForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const form = useForm<ProfessionalRegistrationInput>({
        resolver: zodResolver(professionalRegistrationSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            professionalCard: "",
            terms: false,
        },
        mode: "onChange",
    })

    const { formState: { isDirty, isValid } } = form

    async function onSubmit(values: ProfessionalRegistrationInput) {
        startTransition(async () => {
            try {
                const { error } = await auth.signUp(values.email, values.password, {
                    role: 'PSYCHOLOGIST',
                    full_name: values.name,
                    // CRP será armazenado no perfil de psicólogo posteriormente
                })

                if (error) {
                    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                        toast.error('E-mail já cadastrado. Tente fazer login ou recuperar sua senha.')
                    } else {
                        toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
                    }
                } else {
                    toast.success("Conta criada com sucesso!")
                    // Redirecionar para completar dados profissionais
                    router.push("/cadastro/profissional/dados")
                }
            } catch (error) {
                console.error('Registration error:', error)
                toast.error('Erro ao criar conta. Tente novamente mais tarde.')
            }
        })
    }

    return (
        <div className="w-full space-y-8">
            <Hero />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        placeholder="Digite seu nome completo"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        type="email"
                                        placeholder="Digite seu e-mail"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Criar Senha</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        className="h-[44px]"
                                        placeholder="Digite uma senha segura"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="professionalCard"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número da Carteira Profissional (CRP)</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        placeholder="XX/XXXXX"
                                        maxLength={8}
                                        {...field}
                                        onChange={(e) => {
                                            const masked = maskCRP(e.target.value)
                                            field.onChange(masked)
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Digite seu CRP no formato XX/XXXXX (ex: 06/123456)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                            Aceito os{" "}
                                            <Link href="/termos" className="text-primary underline hover:no-underline">
                                                Termos de Serviço
                                            </Link>
                                            {" "}e a{" "}
                                            <Link href="/privacidade" className="text-primary underline hover:no-underline">
                                                Política de Privacidade
                                            </Link>
                                            .
                                        </FormLabel>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full font-bold"
                        size="lg"
                        disabled={!isValid || !isDirty || isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            "Criar Conta"
                        )}
                    </Button>
                </form>
            </Form>

            <DividerWithText text="Ou cadastre-se com" />

            <SocialLoginButtons />

            <div className="flex items-center justify-between pt-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Cadastro Psicólogo
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Já tem uma conta?</span>
                    <Button variant="link" className="h-auto p-0 font-medium" asChild>
                        <Link href="/login/profissional">Entrar</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

