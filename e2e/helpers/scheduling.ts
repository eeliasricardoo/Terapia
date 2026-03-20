import { Page, expect } from '@playwright/test'

/**
 * Helper para selecionar um psicólogo da busca
 */
export async function selectPsychologist(page: Page, index: number = 0) {
  await page.goto('/busca', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')

  const profileLink = page.locator('a[href^="/psicologo/"]').nth(index)
  await expect(profileLink).toBeVisible({ timeout: 10000 })
  await profileLink.click()
  await page.waitForLoadState('networkidle')
}

/**
 * Helper para agendar uma sessão
 */
export async function bookSession(
  page: Page,
  options?: {
    dateIndex?: number
    timeIndex?: number
    sessionType?: 'single' | 'package'
  }
) {
  const dateIndex = options?.dateIndex ?? 0
  const timeIndex = options?.timeIndex ?? 0
  const sessionType = options?.sessionType ?? 'single'

  // Selecionar tipo de sessão
  if (sessionType === 'package') {
    const packageTab = page.getByRole('button', { name: /pacote mensal/i })
    if (await packageTab.isVisible({ timeout: 5000 })) {
      await packageTab.click()
      await page.waitForTimeout(500)
    }
  }

  // Selecionar data
  const availableDate = page.locator('button[role="gridcell"]:not([disabled])').nth(dateIndex)
  if (await availableDate.isVisible({ timeout: 10000 })) {
    await availableDate.click()
    await page.waitForTimeout(500)

    // Selecionar horário
    const availableTime = page.locator('button:has-text(/\\d{2}:\\d{2}/)').nth(timeIndex)
    if (await availableTime.isVisible()) {
      await availableTime.click()

      // Confirmar
      const confirmButton = page.getByRole('button', { name: /confirmar|agendar/i })
      if (await confirmButton.isVisible({ timeout: 10000 })) {
        await confirmButton.click()

        // Aguardar confirmação ou redirecionamento para pagamento
        await page.waitForTimeout(1000)
      }
    }
  }
}

/**
 * Helper para cancelar uma sessão
 */
export async function cancelSession(page: Page, sessionIndex: number = 0) {
  await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')

  const cancelButton = page.getByRole('button', { name: /cancelar/i }).nth(sessionIndex)

  if (await cancelButton.isVisible({ timeout: 5000 })) {
    await cancelButton.click()

    // Confirmar no modal
    const confirmCancelButton = page.getByRole('button', { name: /sim.*cancelar|confirmar/i })
    if (await confirmCancelButton.isVisible()) {
      await confirmCancelButton.click()

      await expect(page.getByText(/cancelada com sucesso/i)).toBeVisible({ timeout: 10000 })
    }
  }
}

/**
 * Helper para reagendar uma sessão
 */
export async function rescheduleSession(
  page: Page,
  sessionIndex: number = 0,
  newDateIndex: number = 1,
  newTimeIndex: number = 0
) {
  await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')

  const rescheduleButton = page.getByRole('button', { name: /reagendar/i }).nth(sessionIndex)

  if (await rescheduleButton.isVisible({ timeout: 5000 })) {
    await rescheduleButton.click()
    await page.waitForTimeout(500)

    // Selecionar nova data
    const newDate = page.locator('button[role="gridcell"]:not([disabled])').nth(newDateIndex)
    if (await newDate.isVisible()) {
      await newDate.click()
      await page.waitForTimeout(500)

      // Selecionar novo horário
      const newTime = page.locator('button:has-text(/\\d{2}:\\d{2}/)').nth(newTimeIndex)
      if (await newTime.isVisible()) {
        await newTime.click()

        // Confirmar
        const confirmButton = page.getByRole('button', { name: /confirmar/i })
        await confirmButton.click()

        await expect(page.getByText(/reagendada com sucesso/i)).toBeVisible({ timeout: 10000 })
      }
    }
  }
}

/**
 * Helper para obter lista de agendamentos
 */
export async function getUpcomingSessions(page: Page) {
  await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')

  const sessions = await page.locator('[data-testid="session-item"]').all()
  return sessions
}
