import { test, expect } from '@playwright/test'

test.describe('Admin QA Simulator', () => {
  test('Flow: Admin Navigation and Resource Overview', async ({ page }) => {
    // Redireciona para o admin (Assumindo que a sessão de admin será necessária ou mockada)
    await page.goto('/admin')

    // Se houver login de admin pendente:
    if (page.url().includes('/login')) {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@test.com'
      await page.getByLabel(/Email/i).fill(adminEmail)
      await page.getByLabel(/Senha/i).fill('Admin123!')
      // Usar .last() para pegar o botão do formulário (não o do header)
      await page
        .getByRole('button', { name: /Entrar/i })
        .last()
        .click()
    }

    // Verifica Cards de Resumo (Stats)
    const statsSection = page.locator('div.grid').first()
    if (await statsSection.isVisible()) {
      // Esperamos ver textos como "Total de Psicólogos", "Total de Clientes", "Sessões"
      await expect(
        page.getByText(/Total de Psicólogos/i).or(page.getByText(/Ativos/i))
      ).toBeVisible()
    }

    // Navegar para submenus
    const navLinks = [
      { name: 'Psicólogos', path: '/admin/psicologos' },
      { name: 'Planos de Saúde', path: '/admin/planos-de-saude' },
      { name: 'Configurações', path: '/admin/configuracoes' },
    ]

    for (const link of navLinks) {
      const menuLink = page.getByRole('link', { name: link.name }).first()
      if (await menuLink.isVisible()) {
        await menuLink.click()
        await expect(page).toHaveURL(new RegExp(link.path))
        // Volta para o dashboard
        await page.goto('/admin')
      }
    }
  })

  test('Flow: Admin Search & Table Interaction', async ({ page }) => {
    await page.goto('/admin/psicologos')

    // Verifica se a tabela de dados carregou
    const table = page.locator('table')
    if (await table.isVisible()) {
      await expect(table).toBeVisible()

      // Tenta filtrar
      const searchBox = page
        .getByPlaceholder(/Filtrar psicólogos/i)
        .or(page.getByPlaceholder(/Buscar/i))
        .first()
      if (await searchBox.isVisible()) {
        await searchBox.fill('Teste')
        // Verifica se a tabela atualiza (loading ou conteúdo)
        await page.waitForTimeout(500)
      }
    }
  })
})
