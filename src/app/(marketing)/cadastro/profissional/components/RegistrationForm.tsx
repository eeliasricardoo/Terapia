"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "E-mail inválido.",
    }),
    password: z.string()
        .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
        .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." })
        .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula." })
        .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." }),
    professionalCard: z.string().min(6, {
        message: "O número da carteira profissional deve ter pelo menos 6 caracteres.",
    }),
    terms: z.literal(true, {
        errorMap: () => ({ message: "Você deve aceitar os termos de serviço." }),
    }),
})

export function RegistrationForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            professionalCard: "",
            terms: false,
        },
        mode: "onChange",
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // TODO: Integrate with Supabase Auth
        console.log(values)
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
                                <FormLabel>Número da Carteira Profissional</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        placeholder="Digite seu número de licença"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Este número é necessário para verificar suas credenciais profissionais.
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
                        disabled={!form.formState.isValid}
                    >
                        Criar Conta
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

