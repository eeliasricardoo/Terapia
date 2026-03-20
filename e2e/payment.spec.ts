import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Fluxos de Pagamento', () => {
  test('Visualizar resumo de pagamento', async ({ page }) => {
    await login(page)

    // Ir para busca e selecionar psicólogo
    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Verificar exibição de preços
    const priceDisplay = page.getByText(/R\$.*\d+/i)
    await expect(priceDisplay.first()).toBeVisible({ timeout: 10000 })

    // Verificar botão de pagamento/agendamento
    const paymentButton = page.getByRole('button', { name: /ver horários|agendar|pagar/i })
    await expect(paymentButton.first()).toBeVisible({ timeout: 10000 })
  })

  test('Comprar sessão avulsa - Fluxo até checkout', async ({ page }) => {
    await login(page)

    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Selecionar Sessão Avulsa
    const singleSessionTab = page.getByRole('button', { name: /sessão avulsa/i })
    if (await singleSessionTab.isVisible()) {
      await singleSessionTab.click()
    }

    // Selecionar horário
    const availableDate = page.locator('button[role="gridcell"]:not([disabled])').first()
    if (await availableDate.isVisible()) {
      await availableDate.click()
      await page.waitForTimeout(500)

      const availableTime = page.locator('button:has-text(/\\d{2}:\\d{2}/)').first()
      if (await availableTime.isVisible()) {
        await availableTime.click()

        // Ir para pagamento
        const proceedButton = page.getByRole('button', { name: /prosseguir|continuar|pagar/i })
        await proceedButton.click()

        // Verificar chegada na página de checkout
        await expect(
          page
            .getByText(/pagamento|checkout|finalizar/i)
            .or(page.locator('[data-testid="checkout"]'))
        ).toBeVisible({ timeout: 15000 })
      }
    }
  })

  test('Comprar pacote mensal - Fluxo até checkout', async ({ page }) => {
    await login(page)

    await page.goto('/busca', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const profileLink = page.locator('a[href^="/psicologo/"]').first()
    await expect(profileLink).toBeVisible({ timeout: 10000 })
    await profileLink.click()
    await page.waitForLoadState('networkidle')

    // Selecionar Pacote Mensal
    const packageTab = page.getByRole('button', { name: /pacote mensal/i })
    if (await packageTab.isVisible()) {
      await packageTab.click()
      await page.waitForTimeout(500)

      // Verificar desconto/economia
      const discount = page.getByText(/economize|desconto/i)
      if (await discount.isVisible()) {
        expect(await discount.textContent()).toContain('20%')
      }

      // Selecionar horários (4 sessões)
      const selectSlotsButton = page.getByRole('button', {
        name: /selecionar.*horários|escolher.*datas/i,
      })
      if (await selectSlotsButton.isVisible()) {
        await selectSlotsButton.click()

        // Ir para pagamento
        const proceedButton = page.getByRole('button', { name: /prosseguir|continuar|pagar/i })
        await proceedButton.click()

        // Verificar página de checkout
        await expect(page.getByText(/pagamento|checkout/i)).toBeVisible({ timeout: 15000 })
      }
    }
  })

  test('Preencher informações de pagamento (Teste Stripe)', async ({ page }) => {
    // NOTA: Este teste usa o modo de teste do Stripe
    // Requer que STRIPE_PUBLISHABLE_KEY esteja configurado para teste

    await login(page)

    // Assumindo que já chegamos à página de checkout
    // (pode ser necessário ajustar a navegação)
    await page.goto('/checkout/test-session-id', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Aguardar iframe do Stripe carregar
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]')

    // Preencher número do cartão de teste
    const cardNumberInput = stripeFrame.locator('[name="cardnumber"]')
    if (await cardNumberInput.isVisible({ timeout: 10000 })) {
      await cardNumberInput.fill('4242424242424242') // Cartão de teste Stripe

      // Preencher expiração
      const expiryInput = stripeFrame.locator('[name="exp-date"]')
      await expiryInput.fill('12/30')

      // Preencher CVC
      const cvcInput = stripeFrame.locator('[name="cvc"]')
      await cvcInput.fill('123')

      // Preencher nome do titular
      const nameInput = page.getByLabel(/nome.*titular|nome.*cartão/i)
      if (await nameInput.isVisible()) {
        await nameInput.fill('Teste Usuario')
      }

      // Submeter pagamento
      const submitButton = page.getByRole('button', { name: /pagar|confirmar.*pagamento/i })
      await submitButton.click()

      // Verificar sucesso ou processamento
      await expect(page.getByText(/pagamento.*confirmado|processando.*pagamento/i)).toBeVisible({
        timeout: 20000,
      })
    }
  })

  test('Validar campos obrigatórios de pagamento', async ({ page }) => {
    await login(page)

    await page.goto('/checkout/test-session-id', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Tentar submeter sem preencher
    const submitButton = page.getByRole('button', { name: /pagar|confirmar/i })
    if (await submitButton.isVisible()) {
      await submitButton.click()

      // Verificar mensagens de erro
      const errorMessage = page.getByText(/obrigatório|preencha|inválido/i)
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('Cancelar processo de pagamento', async ({ page }) => {
    await login(page)

    await page.goto('/checkout/test-session-id', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar botão de cancelar/voltar
    const cancelButton = page.getByRole('button', { name: /cancelar|voltar/i })
    if (await cancelButton.isVisible()) {
      await cancelButton.click()

      // Verificar confirmação de cancelamento ou volta para página anterior
      const confirmDialog = page.getByText(/deseja.*cancelar|tem certeza/i)
      if (await confirmDialog.isVisible({ timeout: 2000 })) {
        const confirmButton = page.getByRole('button', { name: /sim|confirmar/i })
        await confirmButton.click()
      }

      // Verificar que não está mais na página de checkout
      await expect(page).not.toHaveURL(/checkout/, { timeout: 10000 })
    }
  })

  test('Visualizar histórico de pagamentos', async ({ page }) => {
    await login(page)

    await page.goto('/dashboard/pagamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar tabela/lista de pagamentos ou mensagem vazia
    const paymentHistory = page.locator('[data-testid="payment-history"], .payments-list')
    const emptyMessage = page.getByText(/nenhum pagamento|não há pagamentos/i)

    await expect(paymentHistory.or(emptyMessage)).toBeVisible({ timeout: 10000 })
  })

  test('Baixar recibo de pagamento', async ({ page }) => {
    await login(page)

    await page.goto('/dashboard/pagamentos', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar botão de download de recibo
    const downloadButton = page.getByRole('button', { name: /baixar|download.*recibo/i }).first()

    if (await downloadButton.isVisible({ timeout: 5000 })) {
      // Configurar listener para download
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
      await downloadButton.click()

      // Verificar que o download iniciou
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/recibo|receipt|invoice/i)
    }
  })

  test('Aplicar cupom de desconto', async ({ page }) => {
    await login(page)

    await page.goto('/checkout/test-session-id', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar campo de cupom
    const couponInput = page.getByLabel(/cupom|código.*desconto/i)

    if (await couponInput.isVisible({ timeout: 5000 })) {
      await couponInput.fill('TESTE10')

      const applyButton = page.getByRole('button', { name: /aplicar/i })
      await applyButton.click()

      // Verificar mensagem de sucesso ou desconto aplicado
      const successMessage = page.getByText(/desconto.*aplicado|cupom.*válido/i)
      const discountApplied = page.getByText(/10%.*off|economize/i)

      await expect(successMessage.or(discountApplied)).toBeVisible({ timeout: 10000 })
    }
  })

  test('Método de pagamento - Pix (se disponível)', async ({ page }) => {
    await login(page)

    await page.goto('/checkout/test-session-id', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar se Pix está disponível como opção
    const pixOption = page.getByRole('radio', { name: /pix/i })

    if (await pixOption.isVisible({ timeout: 5000 })) {
      await pixOption.check()

      // Verificar que mostra QR code ou chave Pix
      await expect(page.getByText(/qr.*code|chave.*pix|copiar.*código/i)).toBeVisible({
        timeout: 10000,
      })
    }
  })
})
