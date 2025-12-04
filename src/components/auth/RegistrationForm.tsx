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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Email inválido.",
    }),
    document: z.string().min(6, {
        message: "Cédula deve ter no mínimo 6 dígitos.",
    }).max(10, {
        message: "Cédula deve ter no máximo 10 dígitos.",
    }).regex(/^\d+$/, {
        message: "Cédula deve conter apenas números.",
    }),
    phone: z.string().min(10, {
        message: "Telefone inválido.",
    }),
    birthDate: z.string().refine((value) => {
        const date = new Date(value)
        const now = new Date()
        const age = now.getFullYear() - date.getFullYear()
        return age >= 18
    }, {
        message: "Você deve ter pelo menos 18 anos.",
    }),
    password: z.string()
        .min(8, { message: "Senha deve ter pelo menos 8 caracteres." })
        .regex(/[A-Z]/, { message: "Senha deve conter pelo menos uma letra maiúscula." })
        .regex(/[a-z]/, { message: "Senha deve conter pelo menos uma letra minúscula." })
        .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número." })
        .regex(/[\W_]/, { message: "Senha deve conter pelo menos um caractere especial." }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, {
        message: "Você deve aceitar os termos de uso.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
})

export function RegistrationForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            document: "",
            phone: "",
            birthDate: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        // TODO: Integrate with Supabase Auth
    }

    // Simple masking functions
    const maskDocument = (value: string) => {
        return value.replace(/\D/g, "").slice(0, 10)
    }

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1 $2")
            .replace(/(\d{3})(\d)/, "$1 $2")
            .replace(/(\d{4})\d+?$/, "$1")
    }

    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle className="text-xl">Cadastro de Paciente</CardTitle>
                <CardDescription>
                    Preencha seus dados para começar sua jornada de bem-estar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu nome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="document"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cédula de Ciudadanía</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1234567890"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(maskDocument(e.target.value))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Nascimento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Celular</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="300 123 4567"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(maskPhone(e.target.value))
                                            }}
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="m@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => {
                                    const password = field.value || "";
                                    const hasUpperCase = /[A-Z]/.test(password);
                                    const hasLowerCase = /[a-z]/.test(password);
                                    const hasNumber = /[0-9]/.test(password);
                                    const hasSpecialChar = /[\W_]/.test(password);
                                    const isLengthValid = password.length >= 8;

                                    const strength = [
                                        hasUpperCase,
                                        hasLowerCase,
                                        hasNumber,
                                        hasSpecialChar,
                                        isLengthValid
                                    ].filter(Boolean).length;

                                    return (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Sua senha forte" {...field} />
                                            </FormControl>
                                            <div className="flex gap-1 h-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-full w-full rounded-full transition-colors ${i < strength
                                                                ? strength <= 2
                                                                    ? "bg-red-500"
                                                                    : strength <= 4
                                                                        ? "bg-yellow-500"
                                                                        : "bg-green-500"
                                                                : "bg-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirme sua senha" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="terms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Aceito os Termos de Uso
                                        </FormLabel>
                                        <FormDescription>
                                            Você concorda com nossa <Link href="/termos" className="text-primary hover:underline">Política de Privacidade</Link> e Termos de Serviço.
                                        </FormDescription>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Criar Conta
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
