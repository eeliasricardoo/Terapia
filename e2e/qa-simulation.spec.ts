import { test, expect } from '@playwright/test'

test.describe('QA Simulator: Critical Business Journeys', () => {
  test('Flow: Searching for a Psychologist and Opening Detail', async ({ page }) => {
    await page.goto('/busca', { waitUntil: 'networkidle' })

    // Aguardar o componente cliente carregar completamente
    await page.waitForLoadState('domcontentloaded')

    // Simular o carregamento de esqueleto se houver (skeleton)
    // Se a página for muito rápida, o expect(skeleton).toBeVisible() pode piscar e falhar.
    // Vamos garantir que o input de busca está lá.
    const searchInput = page.getByPlaceholder(/Busque por nome/i)
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('Felipe')

    // Interagir com filtros de categorias (Multiselect ou Select)
    const specialtiesFilter = page.locator('button[role="combobox"]').first()
    if (await specialtiesFilter.isVisible()) {
      await specialtiesFilter.click()
      await page.getByRole('option', { name: /Ansiedade/i }).click()
      // Clica fora para fechar o popover
      await page.mouse.click(0, 0)
    }

    // Esperamos que o app mostre pelo menos a estrutura de cards (mesmo que vazios/filtros não batam, ver se a UI não quebra)
    await expect(
      page
        .getByText(/Mostrando.*profissionais disponíveis/i)
        .or(page.getByText(/Nenhum psicólogo/i))
    ).toBeVisible({ timeout: 10000 })
  })

  test('Flow: Interaction with Scheduling Widget (Widget QA)', async ({ page }) => {
    // Primeiro, buscar um psicólogo disponível na página de busca
    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Aguardar resultados aparecerem e pegar o primeiro link de perfil
    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })

    // Clicar no perfil
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Aguardar o componente cliente carregar completamente
    await page.waitForLoadState('domcontentloaded')

    // Verifica se o widget de agendamento está carregado
    // Pode ser o calendário ou a lista de horários
    const schedulingWidget = page
      .getByText(/Horários disponíveis/i)
      .or(page.getByText(/Escolha um horário/i))
    await expect(schedulingWidget.first()).toBeVisible({ timeout: 10000 })

    // Verifica botões de call to action
    await expect(
      page
        .getByRole('button', { name: /Ver Horários/i })
        .or(page.getByText(/Pacote Mensal/i))
        .first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('Security Flow: Unauthorized Dashboard Access', async ({ page }) => {
    // Tentativa de acesso a rotas protegidas
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/mensagens',
      '/dashboard/psicologo/configuracoes',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      // Deve redirecionar para login ou mostrar mensagem de acesso negado
      await page.waitForURL(
        (url) => url.pathname.includes('/login') || url.pathname.includes('/auth')
      )
      await expect(page).toHaveURL(/\/(login|auth)/)
    }
  })

  test('UI Integrity: Desktop vs Mobile Header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Aguardar o componente cliente carregar completamente
    await page.waitForLoadState('domcontentloaded')

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.getByRole('link', { name: /Buscar Psicólogos/i }).first()).toBeVisible({
      timeout: 10000,
    })

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000) // Aguardar a transição do viewport
    const menuButton = page.locator('button[aria-label="Menu"], button:has(svg.lucide-menu)')
    await expect(menuButton).toBeVisible({ timeout: 5000 })
    await menuButton.click()
    // Aguardar o drawer abrir completamente
    await page.waitForTimeout(1000)
    // Verifica se qualquer link do drawer apareceu (usar um mais genérico)
    await expect(
      page.getByRole('link', { name: /Buscar Psicólogos|Para Psicólogos|Sou Psicólogo/i }).first()
    ).toBeVisible({ timeout: 10000 })
  })
})
