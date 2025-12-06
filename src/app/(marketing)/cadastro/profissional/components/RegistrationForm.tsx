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
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Correo electrónico inválido.",
    }),
    password: z.string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula." })
        .regex(/[a-z]/, { message: "La contraseña debe contener al menos una letra minúscula." })
        .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número." }),
    professionalCard: z.string().min(6, {
        message: "El número de tarjeta profesional debe tener al menos 6 caracteres.",
    }),
    terms: z.boolean().refine((value) => value === true, {
        message: "Debes aceptar los términos de servicio.",
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
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        placeholder="Ingresa tu nombre completo"
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
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        type="email"
                                        placeholder="Ingresa tu correo electrónico"
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
                                <FormLabel>Crear Contraseña</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        className="h-[44px]"
                                        placeholder="Ingresa una contraseña segura"
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
                                <FormLabel>Número de Tarjeta Profesional</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-[44px]"
                                        placeholder="Ingresa tu número de licencia"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Este número es necesario para verificar tus credenciales profesionales.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-normal">
                                        Acepto los{" "}
                                        <Link href="/termos" className="text-primary underline hover:no-underline">
                                            Términos de Servicio
                                        </Link>
                                        {" "}y la{" "}
                                        <Link href="/privacidade" className="text-primary underline hover:no-underline">
                                            Política de Privacidad
                                        </Link>
                                        .
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full font-bold" size="lg">
                        Crear Cuenta
                    </Button>
                </form>
            </Form>

            <DividerWithText text="O regístrate con" />

            <SocialLoginButtons />

            <div className="flex items-center justify-between pt-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Registro Psicólogo
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>¿Ya tienes una cuenta?</span>
                    <Button variant="link" className="h-auto p-0 font-medium" asChild>
                        <Link href="/login/profissional">Log In</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

