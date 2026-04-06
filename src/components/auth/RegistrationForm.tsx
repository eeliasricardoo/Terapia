'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
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
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
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
import { registerPatientSupabase } from '@/lib/actions/auth'
import { auth } from '@/lib/supabase/auth'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

export function RegistrationForm() {
  const router = useRouter()
  const t = useTranslations('Auth.patientRegistration')
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [insurances, setInsurances] = useState<{ id: string; name: string }[]>([])
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

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

  const [honeypot, setHoneypot] = useState('')

  async function onSubmit(values: RegistrationInput) {
    if (honeypot) {
      logger.warn('Honeypot filled, rejecting bot.')
      toast.error(t('errors.honeypot'))
      return
    }

    if (!captchaToken && process.env.NODE_ENV === 'production') {
      toast.error(t('errors.captcha'))
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('name', values.name)
        formData.append('email', values.email)
        formData.append('document', cleanCPF(values.document))
        formData.append('phone', values.phone || '')
        formData.append('birthDate', values.birthDate)
        formData.append('password', values.password)
        formData.append('confirmPassword', values.confirmPassword)
        formData.append('terms', String(values.terms))
        if (captchaToken) formData.append('captcha_token', captchaToken)
        if (values.healthInsuranceId) formData.append('healthInsuranceId', values.healthInsuranceId)
        if (values.healthInsurancePolicy)
          formData.append('healthInsurancePolicy', values.healthInsurancePolicy)

        const result = await registerPatientSupabase(
          formData as unknown as Parameters<typeof registerPatientSupabase>[0]
        )

        if (!result.success) {
          toast.error(result.error || t('errors.apiError'))
        } else {
          toast.success(t('success'))
          router.push(
            `/cadastro/confirmar-email?email=${encodeURIComponent(values.email)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`
          )
        }
      } catch (error) {
        logger.error('Registration error:', error)
        toast.error(t('errors.generic'))
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
            ? t('steps.1.title')
            : step === 2
              ? t('steps.2.title')
              : t('steps.3.title')}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? t('steps.1.description')
            : step === 2
              ? t('steps.2.description')
              : t('steps.3.description')}
        </CardDescription>
      </CardHeader>
      {step === 1 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground text-left">
            {t('professionalPrompt')}{' '}
            <Link
              href="/cadastro/profissional"
              className="text-primary hover:underline font-medium"
            >
              {t('registerAsProfessional')}
            </Link>
          </p>
        </div>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                {/* Honeypot field for simple bot protection */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="confirm_user_registration_verification"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.namePlaceholder')} {...field} />
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
                      <FormLabel>{t('fields.email')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.emailPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" onClick={nextStep} className="w-full">
                  {t('actions.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-sm text-muted-foreground text-center pt-2">
                  {t('loginPrompt')}{' '}
                  <Link
                    href={`/login/paciente${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {t('login')}
                  </Link>{' '}
                  {t('or')}{' '}
                  <Link
                    href="/login/esqueci-senha"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('recoverPassword')}
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
                        <FormLabel>{t('fields.document')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('fields.documentPlaceholder')}
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
                        <FormLabel>{t('fields.phone')}</FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value || '')
                            }}
                            defaultCountry="BR"
                            placeholder={t('fields.phonePlaceholder')}
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
                      <FormLabel>{t('fields.birthDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>{t('fields.birthDateHint')}</FormDescription>
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
                          <FormLabel>{t('fields.password')}</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder={t('fields.passwordPlaceholder')} {...field} />
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
                        <FormLabel>{t('fields.confirmPassword')}</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder={t('fields.confirmPasswordPlaceholder')} {...field} />
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
                        <FormLabel>{t('fields.terms')}</FormLabel>
                        <FormDescription>
                          {t('fields.termsAgreement')}{' '}
                          <Link href="/termos" className="text-primary hover:underline">
                            {t('fields.privacyPolicy')}
                          </Link>{' '}
                          {t('fields.and')} {t('fields.termsOfService')}
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('actions.back')}
                  </Button>
                  <Button type="button" onClick={nextToStep3} className="w-full">
                    {t('actions.continue')} <ArrowRight className="ml-2 h-4 w-4" />
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
                      <FormLabel>{t('fields.healthInsurance')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('fields.selectPlan')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t('fields.noPlan')}</SelectItem>
                          {insurances.map((ins) => (
                            <SelectItem key={ins.id} value={ins.id}>
                              {ins.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('fields.planHint')}
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
                      <FormLabel>{t('fields.policyNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.policyNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center py-2">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={
                      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
                    }
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                    options={{
                      theme: 'light',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('actions.back')}
                  </Button>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('actions.submitting')}
                      </>
                    ) : (
                      t('actions.submit')
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
