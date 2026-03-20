import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Fluxos de Agendamento', () => {
  test('Agendar nova sessão - Fluxo completo', async ({ page }) => {
    // Login como paciente
    await login(page)

    // Ir para busca de psicólogos
    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Selecionar primeiro psicólogo disponível
    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Verificar calendário carregado
    const calendar = page.locator('div.rdp, [role="grid"]')
    await expect(calendar.or(page.getByText(/selecione.*data/i))).toBeVisible({ timeout: 10000 })

    // Selecionar uma data futura (próximo dia disponível)
    const availableDate = page.locator('button[role="gridcell"]:not([disabled])').first()
    if (await availableDate.isVisible()) {
      await availableDate.click()
      await page.waitForTimeout(500)

      // Selecionar um horário
      const availableTime = page.locator('button:has-text(/\\d{2}:\\d{2}/)').first()
      if (await availableTime.isVisible()) {
        await availableTime.click()

        // Confirmar agendamento
        const confirmButton = page.getByRole('button', { name: /confirmar|agendar/i })
        await expect(confirmButton).toBeVisible({ timeout: 10000 })
        await confirmButton.click()

        // Verificar sucesso (pode redirecionar para pagamento ou mostrar confirmação)
        await expect(
          page
            .getByText(/agendamento.*confirmado|sessão.*agendada/i)
            .or(page.locator('[href*="pagamento"]'))
        ).toBeVisible({ timeout: 15000 })
      }
    }
  })

  test('Verificar disponibilidade de horários', async ({ page }) => {
    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Verificar se mostra lista de horários
    const timeSlotsSection = page
      .getByText(/horários disponíveis/i)
      .or(page.locator('[role="grid"]'))
    await expect(timeSlotsSection.first()).toBeVisible({ timeout: 10000 })

    // Verificar que há pelo menos um horário ou mensagem de indisponibilidade
    const hasSlots = await page.locator('button:has-text(/\\d{2}:\\d{2}/)').count()
    const hasNoSlotsMessage = await page.getByText(/sem horários|não há horários/i).count()

    expect(hasSlots > 0 || hasNoSlotsMessage > 0).toBeTruthy()
  })

  test('Visualizar agendamentos futuros', async ({ page }) => {
    await login(page)

    // Ir para dashboard/agendamentos
    await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar lista de agendamentos ou mensagem vazia
    const appointmentsList = page.locator(
      '[data-testid="appointments-list"], .appointments-container'
    )
    const emptyMessage = page.getByText(/nenhum agendamento|não há sessões/i)

    await expect(appointmentsList.or(emptyMessage)).toBeVisible({ timeout: 10000 })
  })

  test('Reagendar sessão existente', async ({ page }) => {
    await login(page)

    await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar se há algum agendamento para reagendar
    const rescheduleButton = page.getByRole('button', { name: /reagendar/i }).first()

    if (await rescheduleButton.isVisible({ timeout: 5000 })) {
      await rescheduleButton.click()

      // Aguardar modal ou nova página de reagendamento
      await page.waitForTimeout(500)

      // Selecionar nova data
      const newDate = page.locator('button[role="gridcell"]:not([disabled])').nth(1)
      if (await newDate.isVisible()) {
        await newDate.click()
        await page.waitForTimeout(500)

        // Selecionar novo horário
        const newTime = page.locator('button:has-text(/\\d{2}:\\d{2}/)').first()
        if (await newTime.isVisible()) {
          await newTime.click()

          // Confirmar reagendamento
          const confirmButton = page.getByRole('button', { name: /confirmar/i })
          await confirmButton.click()

          // Verificar mensagem de sucesso
          await expect(page.getByText(/reagendada com sucesso|sessão.*alterada/i)).toBeVisible({
            timeout: 10000,
          })
        }
      }
    }
  })

  test('Cancelar sessão', async ({ page }) => {
    await login(page)

    await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar se há algum agendamento para cancelar
    const cancelButton = page.getByRole('button', { name: /cancelar/i }).first()

    if (await cancelButton.isVisible({ timeout: 5000 })) {
      await cancelButton.click()

      // Confirmar no modal de confirmação
      const confirmCancelButton = page.getByRole('button', { name: /sim.*cancelar|confirmar/i })
      if (await confirmCancelButton.isVisible()) {
        await confirmCancelButton.click()

        // Verificar mensagem de sucesso
        await expect(page.getByText(/cancelada com sucesso|sessão.*cancelada/i)).toBeVisible({
          timeout: 10000,
        })
      }
    }
  })

  test('Validar política de cancelamento', async ({ page }) => {
    await login(page)

    await page.goto('/dashboard/agendamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const cancelButton = page.getByRole('button', { name: /cancelar/i }).first()

    if (await cancelButton.isVisible({ timeout: 5000 })) {
      await cancelButton.click()

      // Verificar se mostra aviso sobre política de cancelamento
      const policyWarning = page.getByText(/política.*cancelamento|24 horas|antecedência/i)
      await expect(policyWarning.or(page.getByRole('dialog'))).toBeVisible({ timeout: 5000 })
    }
  })

  test('Selecionar tipo de sessão (Avulsa vs Pacote)', async ({ page }) => {
    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Verificar tabs de Sessão Avulsa e Pacote Mensal
    const singleSessionTab = page.getByRole('button', { name: /sessão avulsa|única/i })
    const packageTab = page.getByRole('button', { name: /pacote mensal|plano/i })

    const hasTabs = await singleSessionTab.or(packageTab).isVisible({ timeout: 5000 })

    if (hasTabs) {
      // Clicar em Pacote Mensal
      await packageTab.click()

      // Verificar mudança de preço/descrição
      await expect(page.getByText(/R\$.*\d+/i)).toBeVisible({ timeout: 5000 })
    }
  })
})
