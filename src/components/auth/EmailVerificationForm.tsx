'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useTransition, useEffect } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/supabase/auth'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'

const verificationSchema = z.object({
  code: z
    .string()
    .min(8, 'O código deve ter pelo menos 8 dígitos')
    .max(8, 'O código deve ter 8 dígitos'),
})

type VerificationInput = z.infer<typeof verificationSchema>

export function EmailVerificationForm() {
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
        toast.error('E-mail não encontrado.')
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
          toast.error(error.message || 'Código inválido ou expirado.')
        } else {
          toast.success('E-mail confirmado com sucesso!')
          router.push(
            `/login/paciente${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
          )
        }
      } catch (error) {
        logger.error('Verification error:', error)
        toast.error('Erro ao verificar código. Tente novamente.')
      }
    })
  }

  async function handleResend() {
    if (!displayEmail || resendStatus === 'sending') return

    setResendStatus('sending')
    try {
      const { error } = await auth.resendOtp(displayEmail)
      if (error) {
        toast.error(error.message || 'Erro ao reenviar código.')
        setResendStatus('idle')
      } else {
        toast.success('Novo código enviado!')
        setResendStatus('sent')
        setTimeout(() => setResendStatus('idle'), 60000) // 1 minute cooldown
      }
    } catch (error) {
      toast.error('Erro ao reenviar código.')
      setResendStatus('idle')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
        <CardDescription>
          Enviamos um código de 8 dígitos para{' '}
          <span className="font-semibold text-foreground">{displayEmail}</span>. Digite-o abaixo
          para confirmar sua conta.
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
                  <FormLabel>Código de Verificação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000000"
                      className="text-center text-2xl tracking-[0.3em] font-mono h-14"
                      maxLength={8}
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
                  Verificando...
                </>
              ) : (
                'Confirmar E-mail'
              )}
            </Button>

            <div className="flex flex-col gap-3 pt-2">
              <p className="text-sm text-center text-muted-foreground">
                Não recebeu o código?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus !== 'idle'}
                  className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline"
                >
                  {resendStatus === 'sending'
                    ? 'Enviando...'
                    : resendStatus === 'sent'
                      ? 'Enviado!'
                      : 'Reenviar código'}
                </button>
              </p>

              <Link
                href="/cadastro/paciente"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Alterar e-mail
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
