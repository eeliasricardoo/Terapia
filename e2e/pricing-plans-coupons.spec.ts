import { expect } from '@playwright/test'
import { psychologistTest as test } from './fixtures/auth'

// All tests in this file run as an authenticated psychologist

test.describe('Pricing & Configurações - Acesso Autenticado', () => {
  test('Página carrega com título Serviços & Tarifas', async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await expect(
      page.getByText(/Defina seus preços, crie pacotes e gerencie cupons/i)
    ).toBeVisible()
  })

  test('Três tabs estão presentes e visíveis', async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await expect(page.getByRole('tab', { name: /Sessão/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Pacotes/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Cupons/i })).toBeVisible()
  })

  test('Tab Sessão está ativa por padrão', async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    const tab = page.getByRole('tab', { name: /Sessão/i })
    await expect(tab).toBeVisible()
    await expect(tab).toHaveAttribute('data-state', 'active')
  })
})

test.describe('Pricing & Configurações - Tab Sessão', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    // Wait for the h1 heading (only rendered after isLoading=false, sidebar has same text)
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await page.getByRole('tab', { name: /Sessão/i }).click()
    await page.waitForTimeout(300)
  })

  test('Seção Sessão Avulsa tem campos de preço e duração', async ({ page }) => {
    await expect(page.getByText('Sessão Avulsa')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Valor da sessão')).toBeVisible()
    await expect(page.getByText('Duração')).toBeVisible()
  })

  test('Botão Salvar está presente', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Salvar$/ })).toBeVisible({ timeout: 10000 })
  })

  test('Select de duração tem todas as 5 opções', async ({ page }) => {
    const durationSelect = page.getByRole('combobox')
    await expect(durationSelect).toBeVisible({ timeout: 5000 })
    await durationSelect.click()
    await expect(page.getByRole('option', { name: '30 minutos' })).toBeVisible()
    await expect(page.getByRole('option', { name: '45 minutos' })).toBeVisible()
    await expect(page.getByRole('option', { name: /50 minutos/ })).toBeVisible()
    await expect(page.getByRole('option', { name: '60 minutos' })).toBeVisible()
    await expect(page.getByRole('option', { name: '90 minutos' })).toBeVisible()
  })

  test('Preview aparece ao digitar valor de preço', async ({ page }) => {
    const priceInput = page.locator('input[type="number"]').first()
    await expect(priceInput).toBeVisible({ timeout: 5000 })
    await priceInput.fill('200')
    await page.waitForTimeout(300)
    await expect(page.getByText('Sessão de Terapia Individual')).toBeVisible()
    await expect(page.getByText(/Preview para o paciente/i).first()).toBeVisible()
  })

  test('Seção Plano Mensal está visível com toggle', async ({ page }) => {
    await expect(page.getByText('Plano Mensal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Ofereça um desconto para pacientes/i)).toBeVisible()
  })

  test('Toggle do Plano Mensal exibe campos ao ser ativado', async ({ page }) => {
    const toggle = page.getByRole('switch')

    await expect(toggle).toBeVisible({ timeout: 5000 })
    const isChecked = (await toggle.getAttribute('data-state')) === 'checked'

    if (!isChecked) {
      await toggle.click()
      await page.waitForTimeout(300)
    }

    await expect(page.getByText('Sessões por mês')).toBeVisible()
    await expect(page.getByText('Desconto (%)')).toBeVisible()
  })
})

test.describe('Pricing & Configurações - Tab Pacotes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await page.getByRole('tab', { name: /Pacotes/i }).click()
    await page.waitForTimeout(500)
  })

  test('Tab Pacotes carrega — estado vazio ou lista de pacotes', async ({ page }) => {
    const emptyState = page.getByText('Nenhum pacote criado')
    const hasList = page.getByText(/pacote|sessões/).first()
    expect((await emptyState.isVisible()) || (await hasList.isVisible())).toBeTruthy()
  })

  test('Estado vazio tem botão e descrição corretos', async ({ page }) => {
    if (!(await page.getByText('Nenhum pacote criado').isVisible({ timeout: 3000 }))) return
    await expect(page.getByRole('button', { name: /Criar primeiro pacote/i })).toBeVisible()
    await expect(page.getByText(/aumentam a fidelização/i)).toBeVisible()
  })

  test('Dialog de novo pacote abre com todos os campos', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro pacote/i })
    const newBtn = page.getByRole('button', { name: /Novo pacote/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await expect(page.getByText('Novo Pacote de Sessões')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Nome do Pacote')).toBeVisible()
    await expect(page.getByText('Nº Sessões')).toBeVisible()
    await expect(page.getByText(/Preço Total/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar Pacote' })).toBeVisible()
  })

  test('Dialog calcula valor por sessão: 4 sessões × R$600 = R$150/sessão', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro pacote/i })
    const newBtn = page.getByRole('button', { name: /Novo pacote/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await page.waitForTimeout(300)
    await page.getByPlaceholder('4').fill('4')
    await page.getByPlaceholder('550.00').fill('600')
    await page.waitForTimeout(300)

    await expect(page.getByText(/Valor por sessão neste pacote/i)).toBeVisible()
    await expect(page.getByText(/150/)).toBeVisible()
  })

  test('Dialog de pacote fecha com Escape', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro pacote/i })
    const newBtn = page.getByRole('button', { name: /Novo pacote/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await expect(page.getByText('Novo Pacote de Sessões')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.getByText('Novo Pacote de Sessões')).not.toBeVisible()
  })
})

test.describe('Pricing & Configurações - Tab Cupons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await page.getByRole('tab', { name: /Cupons/i }).click()
    await page.waitForTimeout(500)
  })

  test('Tab Cupons carrega — estado vazio ou lista de cupons', async ({ page }) => {
    const emptyState = page.getByText('Nenhum cupom criado')
    const hasCoupon = page.locator('[class*="font-mono"]').first()
    expect((await emptyState.isVisible()) || (await hasCoupon.isVisible())).toBeTruthy()
  })

  test('Estado vazio tem botão e descrição corretos', async ({ page }) => {
    if (!(await page.getByText('Nenhum cupom criado').isVisible({ timeout: 3000 }))) return
    await expect(page.getByRole('button', { name: /Criar primeiro cupom/i })).toBeVisible()
    await expect(page.getByText(/Crie cupons de desconto/i)).toBeVisible()
  })

  test('Dialog de novo cupom abre com todos os campos', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro cupom/i })
    const newBtn = page.getByRole('button', { name: /Novo cupom/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await expect(page.getByText('Novo Cupom de Desconto')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Código do Cupom')).toBeVisible()
    await expect(page.getByText('Tipo de Desconto')).toBeVisible()
    await expect(page.getByText('Valor do Desconto')).toBeVisible()
    await expect(page.getByText('Limite de Usos (Opcional)')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar Cupom' })).toBeVisible()
  })

  test('Código do cupom é convertido para maiúsculas automaticamente', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro cupom/i })
    const newBtn = page.getByRole('button', { name: /Novo cupom/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await page.waitForTimeout(300)
    const codeInput = page.getByPlaceholder(/PRIMEIRA10/i)
    await expect(codeInput).toBeVisible({ timeout: 5000 })
    await codeInput.fill('desconto20')
    await page.waitForTimeout(200)
    expect(await codeInput.inputValue()).toBe('DESCONTO20')
  })

  test('Select de tipo tem Porcentagem e Valor Fixo', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro cupom/i })
    const newBtn = page.getByRole('button', { name: /Novo cupom/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await page.waitForTimeout(300)
    await page.getByRole('combobox').first().click()
    await expect(page.getByRole('option', { name: 'Porcentagem (%)' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Valor Fixo (R$)' })).toBeVisible()
  })

  test('Dialog de cupom fecha com Escape', async ({ page }) => {
    const emptyBtn = page.getByRole('button', { name: /Criar primeiro cupom/i })
    const newBtn = page.getByRole('button', { name: /Novo cupom/i })
    if (await emptyBtn.isVisible()) await emptyBtn.click()
    else await newBtn.click()

    await expect(page.getByText('Novo Cupom de Desconto')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.getByText('Novo Cupom de Desconto')).not.toBeVisible()
  })
})

test.describe('Pricing & Configurações - Navegação entre Tabs', () => {
  test('Navegar pelas três tabs sem erros', async ({ page }) => {
    await page.goto('/dashboard/configuracoes')
    await expect(page.getByRole('heading', { name: /Serviços.*Tarifas/ })).toBeVisible({
      timeout: 25000,
    })
    await expect(page.getByRole('tab', { name: /Sessão/i })).toBeVisible({ timeout: 10000 })

    for (const tabName of ['Sessão', 'Pacotes', 'Cupons']) {
      const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') })
      await tab.click()
      await page.waitForTimeout(300)
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })
})
