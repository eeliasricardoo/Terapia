import { expect } from '@playwright/test'
import { patientTest as test } from './fixtures/auth'

// All tests run as an authenticated patient

test.describe('Perfil - Página Carrega', () => {
  test('Título Meu Perfil está visível', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    await expect(page.getByRole('heading', { name: 'Meu Perfil' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Gerencie suas informações pessoais e segurança/i)).toBeVisible()
  })

  test('Não redireciona para login quando autenticado', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/perfil')
  })
})

test.describe('Perfil - Tabs', () => {
  test('Tabs Informações Gerais, Meus Planos e Segurança estão presentes', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    await expect(page.getByRole('tab', { name: 'Informações Gerais' })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('tab', { name: 'Meus Planos' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Segurança' })).toBeVisible()
  })

  test('Tab Informações Gerais está ativa por padrão', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    const tab = page.getByRole('tab', { name: 'Informações Gerais' })
    await expect(tab).toBeVisible({ timeout: 10000 })
    await expect(tab).toHaveAttribute('data-state', 'active')
  })

  test('Navegar por todas as tabs sem erros', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    await expect(page.getByRole('tab', { name: 'Informações Gerais' })).toBeVisible({
      timeout: 10000,
    })

    for (const tabName of ['Meus Planos', 'Segurança', 'Informações Gerais']) {
      const tab = page.getByRole('tab', { name: tabName })
      await tab.click()
      await page.waitForTimeout(300)
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })
})

test.describe('Perfil - Tab Meus Planos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/perfil')
    const plansTab = page.getByRole('tab', { name: 'Meus Planos' })
    await expect(plansTab).toBeVisible({ timeout: 10000 })
    await plansTab.click()
    await page.waitForTimeout(500)
  })

  test('Card Planos & Assinaturas está presente', async ({ page }) => {
    await expect(page.getByText('Planos & Assinaturas')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Gerencie seus planos e assinaturas ativas.')).toBeVisible()
  })

  test('Estado "Nenhum plano ativo" é exibido', async ({ page }) => {
    await expect(page.getByText('Nenhum plano ativo')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/agendamentos são feitos por sessão avulsa/i)).toBeVisible()
  })

  test('Card Métodos de Pagamento está presente', async ({ page }) => {
    await expect(page.getByText('Métodos de Pagamento')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/processados de forma segura via Stripe/i)).toBeVisible()
  })

  test('Mensagem sobre não precisar cadastrar cartão está presente', async ({ page }) => {
    await expect(page.getByText(/Não é necessário cadastrar cartões previamente/i)).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Perfil Público - Psicólogo (sem auth necessária)', () => {
  test('/busca carrega psicólogos ou estado vazio', async ({ page }) => {
    await page.goto('/busca')
    await page.waitForTimeout(3000)

    const hasPsychs = (await page.locator('a[href^="/psicologo/"]').count()) > 0
    const hasEmpty = await page.getByText(/nenhum.*encontrado|sem.*resultado/i).isVisible()
    expect(hasPsychs || hasEmpty).toBeTruthy()
  })

  test('Perfil público mostra valor da sessão no widget', async ({ page }) => {
    await page.goto('/busca')
    await page.waitForTimeout(3000)

    const link = page.locator('a[href^="/psicologo/"]').first()
    if (!(await link.isVisible({ timeout: 5000 }))) return

    await link.click()
    await page.waitForTimeout(3000)

    await expect(page.getByText(/Valor da Sessão|R\$/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('Booking widget mostra Sessão Avulsa ou Valor da Sessão', async ({ page }) => {
    await page.goto('/busca')
    await page.waitForTimeout(3000)

    const link = page.locator('a[href^="/psicologo/"]').first()
    if (!(await link.isVisible({ timeout: 5000 }))) return

    await link.click()
    await page.waitForTimeout(3000)

    const hasAvulsa = await page
      .getByText(/Sessão Avulsa/i)
      .first()
      .isVisible({ timeout: 3000 })
    const hasValor = await page
      .getByText(/Valor da Sessão/i)
      .first()
      .isVisible({ timeout: 3000 })
    expect(hasAvulsa || hasValor).toBeTruthy()
  })
})
