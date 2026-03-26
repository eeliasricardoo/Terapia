'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/auth'
import { toast } from 'sonner'
import * as z from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isSent, setIsSent] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      try {
        const result = await requestPasswordReset(values.email)
        if (!result.success) {
          toast.error(result.error || 'Erro ao enviar e-mail de recuperação.')
        } else {
          setIsSent(true)
          toast.success('E-mail de recuperação enviado!')
        }
      } catch {
        toast.error('Erro ao processar solicitação.')
      }
    })
  }

  if (isSent) {
    return (
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos as instruções para recuperação de senha para o seu e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/login/paciente">Voltar para o login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md w-full">
      <CardHeader>
        <div className="mb-4">
          <Link
            href="/login/paciente"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o login
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber as instruções de recuperação.
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
