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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, Check, X, ShieldCheck, Mail } from "lucide-react"
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration"
import { toast } from "sonner"
import { maskCPF, cleanCPF, isValidCPF } from "@/lib/utils/cpf"
import { auth } from "@/lib/supabase/auth"
import { cn } from "@/lib/utils"

export function RegistrationForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [otpCode, setOtpCode] = useState("")
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
            try {
                const { error } = await auth.signUp(values.email, values.password, {
                    role: 'PATIENT',
                    full_name: values.name,
                    phone: values.phone,
                    birth_date: values.birthDate,
                    document: cleanCPF(values.document),
                })

                if (error) {
                    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                        toast.error('E-mail já cadastrado. Tente fazer login ou recuperar sua senha.')
                    } else {
                        toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
                    }
                } else {
                    toast.success("Conta criada! Enviamos um código para o seu e-mail.")
                    setStep(3)
                }
            } catch (error) {
                console.error('Registration error:', error)
                toast.error('Erro ao criar conta. Tente novamente mais tarde.')
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
        if (step === 3) setStep(2)
        else setStep(1)
    }

    const handleVerifyOTP = async () => {
        if (otpCode.length !== 6) {
            toast.error("Por favor, digite o código de 6 dígitos.")
            return
        }

        startTransition(async () => {
            try {
                const { error } = await auth.verifyOtp(form.getValues("email"), otpCode, 'signup')

                if (error) {
                    toast.error(error.message || "Código inválido ou expirado.")
                } else {
                    toast.success("E-mail verificado com sucesso!")
                    router.push("/login/paciente")
                }
            } catch (error) {
                console.error('OTP verification error:', error)
                toast.error('Erro ao verificar código. Tente novamente.')
            }
        })
    }

    // Máscara de CPF
    const maskDocument = (value: string) => {
        return maskCPF(value)
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">
                    {step === 1 ? "Criar conta" : step === 2 ? "Dados Pessoais" : "Verifique seu e-mail"}
                </CardTitle>
                <CardDescription className="text-base">
                    {step === 1
                        ? "Para começar, informe seu CPF"
                        : step === 2
                            ? "Preencha seus dados para finalizar o cadastro."
                            : `Enviamos um código de confirmação para ${form.getValues("email")}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {step === 1 && (
                            <div className="space-y-6 max-w-sm mx-auto py-4">
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
                                                    className="h-12 text-lg text-center tracking-widest"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const masked = maskCPF(e.target.value)
                                                        field.onChange(masked)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-center">
                                                Digite apenas os números do seu CPF
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full h-12 text-base font-semibold transition-all hover:shadow-md"
                                    disabled={!isStep1Valid}
                                >
                                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <p className="text-sm text-muted-foreground text-center pt-2">
                                    É um profissional?{" "}
                                    <Link
                                        href="/cadastro/profissional"
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        Cadastre-se como especialista
                                    </Link>
                                </p>
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
                                                <Input placeholder="Seu nome" autoComplete="name" {...field} />
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
                                                    <Input type="date" autoComplete="bday" {...field} />
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
                                                        value={field.value}
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
                                                <Input placeholder="m@example.com" autoComplete="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Senha</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Sua senha forte" autoComplete="new-password" {...field} />
                                                    </FormControl>
                                                    <div className="flex gap-1 h-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "h-full w-full rounded-full transition-colors",
                                                                    i < strength
                                                                        ? strength <= 2
                                                                            ? "bg-red-500"
                                                                            : strength <= 4
                                                                                ? "bg-yellow-500"
                                                                                : "bg-green-500"
                                                                        : "bg-gray-200"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 mt-3">
                                                        <PasswordRequirement label="8+ caracteres" met={isLengthValid} />
                                                        <PasswordRequirement label="Letra maiúscula" met={hasUpperCase} />
                                                        <PasswordRequirement label="Letra minúscula" met={hasLowerCase} />
                                                        <PasswordRequirement label="Um número" met={hasNumber} />
                                                        <PasswordRequirement label="Caractere especial" met={hasSpecialChar} />
                                                    </div>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Confirmar Senha</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Confirme sua senha" autoComplete="new-password" {...field} />
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

                                <div className="grid grid-cols-2 gap-4 pt-4">
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

                        {step === 3 && (
                            <div className="space-y-6 max-w-sm mx-auto py-4 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-blue-50 rounded-full">
                                        <Mail className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <FormLabel className="text-sm font-medium">Código de Verificação</FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                        className="h-12 text-2xl text-center tracking-[0.5em] font-bold"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        Digite o código de 6 dígitos enviado para seu e-mail.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        className="w-full h-12 text-base font-semibold"
                                        disabled={otpCode.length !== 6 || isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            "Confirmar Código"
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setStep(2)}
                                        className="text-sm text-slate-500"
                                        disabled={isPending}
                                    >
                                        Alterar e-mail
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card >
    )
}

function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 text-[11px] transition-colors",
            met ? "text-green-600" : "text-slate-400"
        )}>
            {met ? (
                <Check className="h-3 w-3 shrink-0" />
            ) : (
                <div className="h-3 w-3 rounded-full border border-slate-300 shrink-0" />
            )}
            <span>{label}</span>
        </div>
    )
}

