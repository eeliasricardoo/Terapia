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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    email: z.string().optional(),
    password: z.string().optional(),
})

export function LoginForm() {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        // TODO: Integrate with Supabase Auth
        // For now, redirect to dashboard or home
        router.push("/dashboard")
    }

    return (
        <Card className="mx-auto max-w-md w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
                <CardDescription className="text-center">
                    Digite seu email e senha para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="seu@email.com" {...field} />
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
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Não tem uma conta?{" "}
                    <Link href="/cadastro/paciente" className="underline text-primary">
                        Cadastre-se
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
