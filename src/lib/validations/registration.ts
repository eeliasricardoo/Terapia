import { z } from "zod"
import { isValidCPF, cleanCPF } from "@/lib/utils/cpf"

export const registrationSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  document: z.string()
    .min(1, {
      message: "CPF é obrigatório.",
    })
    .refine((value) => {
      const cleaned = cleanCPF(value)
      return cleaned.length === 11
    }, {
      message: "CPF deve ter 11 dígitos.",
    })
    .refine((value) => isValidCPF(value), {
      message: "CPF inválido. Verifique os dígitos.",
    }),
  phone: z.string()
    .min(1, {
      message: "Telefone é obrigatório.",
    })
    .refine((value) => {
      // Remove código do país e espaços para validar
      const cleaned = value.replace(/^\+\d+\s*/, "").replace(/\D/g, "")
      // Mínimo 10 dígitos (sem código do país)
      return cleaned.length >= 10
    }, {
      message: "Telefone deve ter pelo menos 10 dígitos.",
    }),
  birthDate: z.string().refine((value) => {
    const date = new Date(value)
    const now = new Date()
    const age = now.getFullYear() - date.getFullYear()
    const monthDiff = now.getMonth() - date.getMonth()
    const dayDiff = now.getDate() - date.getDate()
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
      ? age - 1 
      : age
    
    return actualAge >= 18
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

export type RegistrationInput = z.infer<typeof registrationSchema>

