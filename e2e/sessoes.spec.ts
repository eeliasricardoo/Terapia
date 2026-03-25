import { expect } from '@playwright/test'
import { patientTest as test } from './fixtures/auth'

// All tests run as an authenticated patient

test.describe('Sessões - Página Carrega', () => {
  test('Título Minhas Sessões está visível', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await expect(page.getByRole('heading', { name: 'Minhas Sessões' })).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText(/Gerencie seus agendamentos e histórico/i)).toBeVisible()
  })

  test('Não redireciona para login quando autenticado', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/sessoes')
  })
})

test.describe('Sessões - Estado Vazio', () => {
  test('Estado vazio mostra mensagem e link para busca', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const hasEmpty = await page.getByText('Nenhuma sessão encontrada.').isVisible()
    const hasSessions = await page.locator('[class*="CardContent"]').first().isVisible()

    // Um dos dois deve estar visível
    expect(hasEmpty || hasSessions).toBeTruthy()

    if (hasEmpty) {
      await expect(page.getByText(/agendamentos aparecerão aqui/i)).toBeVisible()
      // Multiple "Buscar Psicólogos" links exist (sidebar + empty state + footer); use first()
      await expect(page.getByRole('link', { name: 'Buscar Psicólogos' }).first()).toBeVisible()
    }
  })

  test('Link "Buscar Psicólogos" leva para /busca', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const link = page.getByRole('link', { name: 'Buscar Psicólogos' }).first()
    if (!(await link.isVisible())) return

    await link.click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/busca')
  })
})

test.describe('Sessões - Cards', () => {
  test('Cada card de sessão mostra indicador Online', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const isEmpty = await page.getByText('Nenhuma sessão encontrada.').isVisible()
    if (isEmpty) return

    await expect(page.getByText('Online').first()).toBeVisible({ timeout: 5000 })
  })

  test('Badges de status são exibidos nos cards', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const isEmpty = await page.getByText('Nenhuma sessão encontrada.').isVisible()
    if (isEmpty) return

    // Algum badge de status deve estar presente
    const agendada = page.getByText('Agendada').first()
    const realizada = page.getByText('Realizada').first()
    const cancelada = page.getByText('Cancelada').first()

    const hasBadge =
      (await agendada.isVisible({ timeout: 3000 })) ||
      (await realizada.isVisible({ timeout: 3000 })) ||
      (await cancelada.isVisible({ timeout: 3000 }))

    expect(hasBadge).toBeTruthy()
  })

  test('Sessões realizadas mostram botão "Agendar Novamente"', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const isEmpty = await page.getByText('Nenhuma sessão encontrada.').isVisible()
    if (isEmpty) return

    const agendarNovamente = page.getByRole('link', { name: 'Agendar Novamente' }).first()
    if (!(await agendarNovamente.isVisible({ timeout: 3000 }))) return

    await agendarNovamente.click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/busca')
  })
})

test.describe('Sessões - Dialog de Reagendamento', () => {
  test('Botão "Reagendar" abre dialog com título Reagendar Sessão', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const reagendarBtn = page.getByRole('button', { name: 'Reagendar' }).first()
    if (!(await reagendarBtn.isVisible({ timeout: 3000 }))) return

    await reagendarBtn.click()
    await expect(page.getByText('Reagendar Sessão')).toBeVisible({ timeout: 5000 })
  })

  test('Dialog de reagendamento carrega calendário', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const reagendarBtn = page.getByRole('button', { name: 'Reagendar' }).first()
    if (!(await reagendarBtn.isVisible({ timeout: 3000 }))) return

    await reagendarBtn.click()
    await page.waitForTimeout(2000)

    // Deve mostrar "Carregando agenda..." ou o calendário
    const loading = page.getByText('Carregando agenda...')
    const calendar = page.getByText(/Horários Disponíveis/i)

    const hasCalendar =
      (await loading.isVisible({ timeout: 3000 })) || (await calendar.isVisible({ timeout: 8000 }))

    expect(hasCalendar).toBeTruthy()
  })

  test('Dialog fecha ao pressionar Escape', async ({ page }) => {
    await page.goto('/dashboard/sessoes')
    await page.waitForTimeout(2000)

    const reagendarBtn = page.getByRole('button', { name: 'Reagendar' }).first()
    if (!(await reagendarBtn.isVisible({ timeout: 3000 }))) return

    await reagendarBtn.click()
    await expect(page.getByText('Reagendar Sessão')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.getByText('Reagendar Sessão')).not.toBeVisible()
  })
})
