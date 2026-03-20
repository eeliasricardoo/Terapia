import { test, expect } from '@playwright/test'

test.describe('Página Inicial', () => {
  test('Home page carrega corretamente', async ({ page }) => {
    await page.goto('/')

    // Verificar que a página carregou
    await expect(page).toHaveURL('/')

    // Aguardar conteúdo principal
    await page.waitForLoadState('domcontentloaded')
  })

  test('Hero section está visível', async ({ page }) => {
    await page.goto('/')

    // Procurar título principal ou call to action
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible({ timeout: 10000 })
  })

  test('Navegação header está presente', async ({ page }) => {
    await page.goto('/')

    // Verificar botões principais de navegação
    const hasLoginButton = await page.getByRole('button', { name: /entrar/i }).count()
    const hasSignupButton = await page
      .getByRole('button', { name: /começar|cadastr|criar conta/i })
      .count()

    expect(hasLoginButton + hasSignupButton).toBeGreaterThan(0)
  })

  test('Links de navegação funcionam', async ({ page }) => {
    await page.goto('/')

    // Procurar link para busca/explorar
    const exploreLink = page
      .getByRole('link', { name: /buscar|explorar|encontrar|psicólogo/i })
      .first()

    if (await exploreLink.isVisible({ timeout: 3000 })) {
      await exploreLink.click()
      await page.waitForURL('**/busca**', { timeout: 5000 })
    }
  })

  test('Footer está presente', async ({ page }) => {
    await page.goto('/')

    // Scroll até o footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Verificar links do footer
    const footerLinks = await page.locator('footer a, [role="contentinfo"] a').count()
    expect(footerLinks).toBeGreaterThan(0)
  })
})

test.describe('Páginas Institucionais', () => {
  test('Página Sobre carrega', async ({ page }) => {
    await page.goto('/sobre')

    await expect(page).toHaveURL(/\/sobre/)
    await page.waitForLoadState('domcontentloaded')
  })

  test('Página Termos carrega', async ({ page }) => {
    await page.goto('/termos')

    await expect(page).toHaveURL(/\/termos/)
    await page.waitForLoadState('domcontentloaded')
  })

  test('Página Privacidade carrega', async ({ page }) => {
    await page.goto('/privacidade')

    await expect(page).toHaveURL(/\/privacidade/)
    await page.waitForLoadState('domcontentloaded')
  })

  test('Página Contato carrega', async ({ page }) => {
    await page.goto('/contato')

    await expect(page).toHaveURL(/\/contato/)
    await page.waitForLoadState('domcontentloaded')
  })

  test('Página Para Psicólogos carrega', async ({ page }) => {
    await page.goto('/para-psicologos')

    await expect(page).toHaveURL(/\/para-psicologos/)
    await page.waitForLoadState('domcontentloaded')
  })

  test('Página Para Empresas carrega', async ({ page }) => {
    await page.goto('/para-empresas')

    await expect(page).toHaveURL(/\/para-empresas/)
    await page.waitForLoadState('domcontentloaded')
  })
})

test.describe('Responsividade Básica', () => {
  test('Mobile: Home carrega em viewport mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')

    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('Tablet: Home carrega em viewport tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/')

    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('Desktop: Home carrega em viewport desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.locator('h1').first()).toBeVisible()
  })
})
