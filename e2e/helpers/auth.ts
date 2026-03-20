import { Page, expect } from '@playwright/test'

/**
 * Helper para fazer login como paciente ou psicólogo
 */
export async function login(
  page: Page,
  role: 'paciente' | 'psicologo' = 'paciente',
  options?: {
    email?: string
    password?: string
  }
) {
  const email = options?.email || process.env.TEST_USER_EMAIL || 'teste@example.com'
  const password = options?.password || process.env.TEST_USER_PASSWORD || 'senha123'

  await page.goto(`/login/${role}`, { waitUntil: 'networkidle' })

  const emailInput = page.getByLabel(/email/i)
  await expect(emailInput).toBeVisible({ timeout: 10000 })
  await emailInput.fill(email)

  const passwordInput = page.getByLabel(/senha/i)
  await passwordInput.fill(password)

  // Usar .last() para pegar o botão do formulário (não o do header)
  const submitButton = page.getByRole('button', { name: /entrar|login/i }).last()
  await submitButton.click()

  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

/**
 * Helper para fazer logout
 */
export async function logout(page: Page) {
  const userMenu = page.getByRole('button', { name: /menu.*usuário|perfil/i })

  if (await userMenu.isVisible()) {
    await userMenu.click()
    const logoutButton = page.getByRole('menuitem', { name: /sair|logout/i })
    await logoutButton.click()

    await expect(page).toHaveURL(/\/(login|^\/$)/, { timeout: 10000 })
  }
}

/**
 * Helper para criar uma nova conta
 */
export async function createAccount(
  page: Page,
  role: 'patient' | 'psychologist',
  userData: {
    name: string
    email: string
    password: string
    crp?: string
  }
) {
  // Usar as rotas corretas
  const route = role === 'patient' ? '/cadastro/paciente' : '/cadastro/profissional'
  await page.goto(route, { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')

  const nameInput = page.getByLabel(/nome completo/i)
  await expect(nameInput).toBeVisible({ timeout: 10000 })
  await nameInput.fill(userData.name)

  const emailInput = page.getByLabel(/e-mail/i)
  await emailInput.fill(userData.email)

  if (role === 'psychologist' && userData.crp) {
    const crpInput = page.getByLabel(/carteira profissional|crp/i)
    if (await crpInput.isVisible()) {
      await crpInput.fill(userData.crp)
    }
  }

  const passwordInput = page.getByLabel(/criar senha|senha/i).first()
  await passwordInput.fill(userData.password)

  const confirmPasswordInput = page.getByLabel(/confirmar senha/i)
  if (await confirmPasswordInput.isVisible()) {
    await confirmPasswordInput.fill(userData.password)
  }

  const termsCheckbox = page.getByRole('checkbox', { name: /termos/i })
  if (await termsCheckbox.isVisible()) {
    await termsCheckbox.check()
  }

  // Usar .last() para pegar o botão do formulário (não o do header)
  const submitButton = page.getByRole('button', { name: /criar conta|cadastrar/i }).last()
  await submitButton.click()

  await expect(page).toHaveURL(
    /\/(dashboard|login|verificar-email|onboarding|cadastro\/profissional\/dados)/,
    { timeout: 15000 }
  )
}

/**
 * Helper para verificar se está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url()
  return url.includes('/dashboard')
}
