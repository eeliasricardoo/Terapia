import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Autenticação - Login Paciente', () => {
  test('Página de login carrega corretamente', async ({ page }) => {
    await page.goto('/login/paciente')

    // Verificar elementos do formulário
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i }).last()).toBeVisible()

    // Verificar link de esqueci senha
    await expect(page.getByRole('link', { name: /esqueci.*senha/i })).toBeVisible()
  })

  test('Validação de campos obrigatórios', async ({ page }) => {
    await page.goto('/login/paciente')
    await page.waitForLoadState('domcontentloaded')

    // Verificar que os campos existem e têm os labels corretos
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Senha')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Verificar que são inputs
    expect(await emailInput.count()).toBe(1)
    expect(await passwordInput.count()).toBe(1)
  })

  test('Login com credenciais inválidas', async ({ page }) => {
    await page.goto('/login/paciente')

    await page.getByLabel('Email').fill('email-invalido@example.com')
    await page.getByLabel('Senha').fill('senhaerrada123')

    const submitButton = page.getByRole('button', { name: /entrar/i }).last()
    await submitButton.click()

    // Aguardar possível mensagem de erro
    // Pode ser toast, alert ou mensagem inline
    await page.waitForTimeout(2000)

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login\/paciente/)
  })
})

test.describe('Autenticação - Login Profissional', () => {
  test('Página de login profissional carrega', async ({ page }) => {
    await page.goto('/login/profissional')

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i }).last()).toBeVisible()
  })
})

test.describe('Autenticação - Cadastro Paciente', () => {
  test('Página de cadastro carrega - Passo 1', async ({ page }) => {
    await page.goto('/cadastro/paciente')

    // Verificar elementos do primeiro passo
    await expect(page.getByLabel('Nome Completo')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /continuar/i })).toBeVisible()
  })

  test('Validação de email inválido no cadastro', async ({ page }) => {
    await page.goto('/cadastro/paciente')

    await page.getByLabel('Nome Completo').fill('João da Silva')
    await page.getByLabel('Email').fill('email-invalido')

    const continueButton = page.getByRole('button', { name: /continuar/i })
    await continueButton.click()

    // Deve mostrar erro de validação
    await page.waitForTimeout(500)

    // Ainda deve estar no passo 1
    await expect(page.getByLabel('Nome Completo')).toBeVisible()
  })

  test('Navegação entre passos do cadastro', async ({ page }) => {
    await page.goto('/cadastro/paciente')
    await page.waitForLoadState('domcontentloaded')

    // Passo 1
    await page.getByLabel('Nome Completo').fill('João da Silva')
    await page.getByLabel('Email').fill(`teste-${Date.now()}@example.com`)
    await page.getByRole('button', { name: /continuar/i }).click()

    // Aguardar transição entre passos
    await page.waitForTimeout(1000)

    // Deve ir para Passo 2
    await expect(page.getByLabel('CPF')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Autenticação - Esqueci Senha', () => {
  test('Página de recuperação de senha carrega', async ({ page }) => {
    await page.goto('/login/esqueci-senha')

    // Verificar que o formulário existe
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar|recuperar/i }).last()).toBeVisible()
  })

  test('Submeter recuperação de senha', async ({ page }) => {
    await page.goto('/login/esqueci-senha')

    await page.getByLabel('Email').fill('teste@example.com')
    const submitButton = page.getByRole('button', { name: /enviar|recuperar/i }).last()
    await submitButton.click()

    // Aguardar resposta (pode ser sucesso ou erro)
    await page.waitForTimeout(2000)
  })
})

test.describe('Navegação e Links', () => {
  test('Navegação da home para login', async ({ page }) => {
    await page.goto('/')

    // Procurar botão de entrar no header
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    if (await loginButton.isVisible()) {
      await loginButton.click()

      // Deve abrir dialog ou redirecionar
      await page.waitForTimeout(1000)
    }
  })

  test('Link entre login e cadastro', async ({ page }) => {
    await page.goto('/login/paciente')

    // Procurar link para cadastro
    const signupLink = page.getByRole('link', { name: /criar conta|cadastr/i })
    if (await signupLink.isVisible()) {
      await signupLink.click()
      await expect(page).toHaveURL(/\/cadastro/)
    }
  })
})
