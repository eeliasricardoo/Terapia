'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useTransition, useEffect } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/supabase/auth'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

const verificationSchema = z.object({
  code: z.string().min(6, 'O código deve ter 6 dígitos').max(6, 'O código deve ter 6 dígitos'),
})

type VerificationInput = z.infer<typeof verificationSchema>

export function EmailVerificationForm() {
  const t = useTranslations('Auth.emailVerification')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const returnTo = searchParams.get('returnTo')
  const [isPending, startTransition] = useTransition()
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [displayEmail, setDisplayEmail] = useState<string | null>(email)

  const form = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    async function checkSession() {
      if (!displayEmail) {
        const {
          data: { user },
        } = await auth.getUser()
        if (user?.email) {
          setDisplayEmail(user.email)
          return
        }
        toast.error(t('errors.notFound'))
        router.push('/cadastro/paciente')
      }
    }
    checkSession()
  }, [displayEmail, router])

  async function onSubmit(values: VerificationInput) {
    if (!displayEmail) return

    startTransition(async () => {
      try {
        const { error } = await auth.verifyOtp(displayEmail, values.code, 'signup')

        if (error) {
          toast.error(error.message || t('errors.apiError'))
        } else {
          toast.success(t('success'))
          router.push(
            `/login/paciente${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
          )
        }
      } catch (error) {
        logger.error('Verification error:', error)
        toast.error(t('errors.generic'))
      }
    })
  }

  async function handleResend() {
    if (!displayEmail || resendStatus === 'sending') return

    setResendStatus('sending')
    try {
      const { error } = await auth.resendOtp(displayEmail)
      if (error) {
        toast.error(error.message || t('errors.resendApiError'))
        setResendStatus('idle')
      } else {
        toast.success(t('resendSuccess'))
        setResendStatus('sent')
        setTimeout(() => setResendStatus('idle'), 60000) // 1 minute cooldown
      }
    } catch (error) {
      toast.error(t('errors.resendGeneric'))
      setResendStatus('idle')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('descriptionPart1')}
          <span className="font-semibold text-foreground">{displayEmail}</span>{t('descriptionPart2')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('code')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('codePlaceholder')}
                      className="text-center text-3xl tracking-[0.5em] font-mono h-14"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </Button>

            <div className="flex flex-col gap-3 pt-2">
              <p className="text-sm text-center text-muted-foreground">
                {t('notReceived')}{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus !== 'idle'}
                  className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline"
                >
                  {resendStatus === 'sending'
                    ? t('resending')
                    : resendStatus === 'sent'
                      ? t('resent')
                      : t('resend')}
                </button>
              </p>

              <Link
                href="/cadastro/paciente"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('changeEmail')}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
