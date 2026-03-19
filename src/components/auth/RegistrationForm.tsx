'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { registrationSchema, type RegistrationInput } from '@/lib/validations/registration'
import { toast } from 'sonner'
import { getHealthInsurances } from '@/lib/actions/health-insurance'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { maskCPF, cleanCPF, isValidCPF } from '@/lib/utils/cpf'
import { auth } from '@/lib/supabase/auth'

export function RegistrationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [insurances, setInsurances] = useState<{ id: string; name: string }[]>([])

  useState(() => {
    async function fetchInsurances() {
      const result = await getHealthInsurances()
      if (result.success && result.data) {
        setInsurances(result.data)
      }
    }
    fetchInsurances()
  })
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      document: '',
      phone: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
      terms: false,
      healthInsuranceId: '',
      healthInsurancePolicy: '',
    },
    mode: 'onChange', // Validação em tempo real
  })

  const {
    formState: { isDirty, isValid, errors },
  } = form

  async function onSubmit(values: RegistrationInput) {
    startTransition(async () => {
      try {
        const { error } = await auth.signUp(values.email, values.password, {
          role: 'PATIENT',
          full_name: values.name,
          phone: values.phone,
          birth_date: values.birthDate,
          document: cleanCPF(values.document),
          health_insurance_id: values.healthInsuranceId || undefined,
          health_insurance_policy: values.healthInsurancePolicy || undefined,
        })

        if (error) {
          if (
            error.message.includes('already registered') ||
            error.message.includes('User already registered')
          ) {
            toast.error('E-mail já cadastrado. Tente fazer login ou recuperar sua senha.')
          } else {
            toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
          }
        } else {
          toast.success(
            'Conta criada com sucesso! Enviamos um código de confirmação para seu e-mail.'
          )
          router.push(
            `/cadastro/confirmar-email?email=${encodeURIComponent(values.email)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`
          )
        }
      } catch (error) {
        console.error('Registration error:', error)
        toast.error('Erro ao criar conta. Tente novamente mais tarde.')
      }
    })
  }

  const nextStep = async () => {
    // Validar apenas os campos do passo 1 antes de avançar
    const isStep1FieldsValid = await form.trigger(['name', 'email'])
    if (isStep1FieldsValid) {
      setStep(2)
    }
  }

  const nextToStep3 = async () => {
    const isStep2FieldsValid = await form.trigger([
      'document',
      'phone',
      'birthDate',
      'password',
      'confirmPassword',
      'terms',
    ])
    if (isStep2FieldsValid) {
      setStep(3)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  // Máscara de CPF
  const maskDocument = (value: string) => {
    return maskCPF(value)
  }

  return (
    <Card
      className={cn(
        'w-full mx-auto transition-all duration-300',
        step === 1 ? 'max-w-md' : step === 2 ? 'max-w-2xl' : 'max-w-md'
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">
          {step === 1
            ? 'Crie sua conta'
            : step === 2
              ? 'Dados Necessários'
              : 'Plano de Saúde (Opcional)'}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? 'Comece informando seus dados básicos.'
            : step === 2
              ? 'Preencha as informações restantes para sua segurança.'
              : 'Se você possui um plano de saúde, informe os dados abaixo.'}
        </CardDescription>
      </CardHeader>
      {step === 1 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground text-left">
            É um profissional?{' '}
            <Link
              href="/cadastro/profissional"
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se como especialista
            </Link>
          </p>
        </div>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Como gostaria de ser chamado?" {...field} />
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
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" onClick={nextStep} className="w-full">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-sm text-muted-foreground text-center pt-2">
                  Já tem uma conta?{' '}
                  <Link
                    href={`/login/paciente${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Faça login
                  </Link>{' '}
                  ou{' '}
                  <Link
                    href="/login/esqueci-senha"
                    className="text-primary hover:underline font-medium"
                  >
                    recupere sua senha
                  </Link>
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                              field.onChange(value || '')
                            }}
                            defaultCountry="BR"
                            placeholder="(00) 00000-0000"
                            className="h-[44px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Você deve ter pelo menos 18 anos</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => {
                      const password = field.value || ''
                      const hasUpperCase = /[A-Z]/.test(password)
                      const hasLowerCase = /[a-z]/.test(password)
                      const hasNumber = /[0-9]/.test(password)
                      const hasSpecialChar = /[\W_]/.test(password)
                      const isLengthValid = password.length >= 8

                      const strength = [
                        hasUpperCase,
                        hasLowerCase,
                        hasNumber,
                        hasSpecialChar,
                        isLengthValid,
                      ].filter(Boolean).length

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
                                className={`h-full w-full rounded-full transition-colors ${
                                  i < strength
                                    ? strength <= 2
                                      ? 'bg-red-500'
                                      : strength <= 4
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    : 'bg-gray-200'
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Aceito os Termos de Uso</FormLabel>
                        <FormDescription>
                          Você concorda com nossa{' '}
                          <Link href="/termos" className="text-primary hover:underline">
                            Política de Privacidade
                          </Link>{' '}
                          e Termos de Serviço.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" onClick={nextToStep3} className="w-full">
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="healthInsuranceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Saúde</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum / Prefiro não informar</SelectItem>
                          {insurances.map((ins) => (
                            <SelectItem key={ins.id} value={ins.id}>
                              {ins.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Isso nos ajuda a encontrar profissionais que aceitam seu plano.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="healthInsurancePolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Carteirinha / Apólice</FormLabel>
                      <FormControl>
                        <Input placeholder="0000 0000 0000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
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
