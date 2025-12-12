"use server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { registrationSchema } from "@/lib/validations/registration"
import { cleanCPF } from "@/lib/utils/cpf"
import { revalidatePath } from "next/cache"

export type ActionResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function registerPatient(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extrair dados do FormData
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      document: formData.get("document") as string,
      phone: formData.get("phone") as string,
      birthDate: formData.get("birthDate") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      terms: formData.get("terms") === "true",
    }

    // Validar com Zod
    const validation = registrationSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      validation.error.errors.forEach((error) => {
        const field = error.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })
      return {
        success: false,
        fieldErrors,
      }
    }

    const data = validation.data

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "E-mail já cadastrado. Tente fazer login ou recuperar sua senha.",
      }
    }

    // Hash da senha
    const hashedPassword = await hash(data.password, 12)

    // Limpar CPF (remover máscara) antes de salvar
    const cleanedDocument = cleanCPF(data.document)

    // Criar usuário e perfil
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "PATIENT",
        profile: {
          create: {
            fullName: data.name,
            // Aqui você pode adicionar o CPF ao perfil se necessário
            // document: cleanedDocument,
          },
        },
      },
    })

    // Aqui você pode adicionar lógica adicional:
    // - Enviar email de confirmação
    // - Criar registro de onboarding
    // - etc.

    revalidatePath("/")
    
    // Retornar sucesso - o redirect será feito no cliente
    return {
      success: true,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Erro ao criar conta. Tente novamente mais tarde.",
    }
  }
}

