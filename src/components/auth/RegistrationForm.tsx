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
import { PhoneInput } from "@/components/ui/phone-input"
import type { E164Number } from "react-phone-number-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration"
import { registerPatient } from "@/app/actions/auth"
import { toast } from "sonner"
import { maskCPF, cleanCPF, isValidCPF } from "@/lib/utils/cpf"

export function RegistrationForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isPending, startTransition] = useTransition()
    const form = useForm<RegistrationInput>({
        resolver: zodResolver(registrationSchema),
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
        mode: "onChange", // Validação em tempo real
    })

    const { formState: { isDirty, isValid, errors } } = form

    async function onSubmit(values: RegistrationInput) {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("email", values.email)
            formData.append("document", values.document)
            formData.append("phone", values.phone)
            formData.append("birthDate", values.birthDate)
            formData.append("password", values.password)
            formData.append("confirmPassword", values.confirmPassword)
            formData.append("terms", values.terms.toString())

            const result = await registerPatient(formData)

            if (!result.success) {
                if (result.fieldErrors) {
                    // Aplicar erros de campo
                    Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                        form.setError(field as keyof RegistrationInput, {
                            type: "server",
                            message: messages[0],
                        })
                    })
                } else if (result.error) {
                    toast.error(result.error)
                }
            } else {
                toast.success("Conta criada com sucesso!")
                // Redirecionar após sucesso
                router.push("/onboarding")
            }
        })
    }

    const nextStep = async () => {
        const isValid = await form.trigger("document")
        if (isValid) {
            setStep(2)
        }
    }

    // Verificar se o step 1 está válido (apenas CPF)
    const documentValue = form.watch("document")
    const cleanedCPF = documentValue ? cleanCPF(documentValue) : ""
    const isStep1Valid = step === 1 && 
      documentValue && 
      cleanedCPF.length === 11 &&
      isValidCPF(documentValue) &&
      !form.formState.errors.document

    // Verificar se o step 2 está válido e dirty
    const isStep2Valid = step === 2 && isValid && isDirty

    const prevStep = () => {
        setStep(1)
    }

    // Máscara de CPF
    const maskDocument = (value: string) => {
        return maskCPF(value)
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-xl">
                    {step === 1 ? "Identificação" : "Dados Pessoais"}
                </CardTitle>
                <CardDescription>
                    {step === 1
                        ? "Informe seu documento para continuar."
                        : "Preencha seus dados para finalizar o cadastro."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {step === 1 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="document"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CPF</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="000.000.000-00"
                                                    maxLength={14}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const masked = maskDocument(e.target.value)
                                                        field.onChange(masked)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Digite apenas os números do seu CPF
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full"
                                    disabled={!isStep1Valid}
                                >
                                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
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
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Celular</FormLabel>
                                                <FormControl>
                                                    <PhoneInput
                                                        value={field.value as E164Number | undefined}
                                                        onChange={(value) => {
                                                            field.onChange(value || "")
                                                        }}
                                                        defaultCountry="BR"
                                                        placeholder="(00) 00000-0000"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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

                                <div className="grid grid-cols-2 gap-4">
                                    <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={!isStep2Valid || isPending}
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
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

