import { test, expect } from '@playwright/test'

test('login flow for patient', async ({ page }) => {
  await page.goto('/')

  // Open Login Dialog (Desktop)
  await page.locator('.hidden.md\\:flex').getByRole('button', { name: 'Entrar' }).click()

  // Wait for dialog
  await expect(page.getByRole('dialog')).toBeVisible()

  // Check if dialog title is correct
  await expect(page.getByText('Bem-vindo de volta')).toBeVisible()

  // Click "Para Mim"
  await page.getByText('Para Mim').click()

  // Should be on /login/paciente
  await expect(page).toHaveURL(/\/login\/paciente/)

  // Check for Login Form
  await expect(page.getByText('Entrar').first()).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()

  // Fill form
  await page.getByLabel('Email').fill('paciente.carlos@test.com')
  await page.getByLabel('Senha').fill('password123')

  // Submit - usar .last() para pegar o botão do formulário (não o do header)
  await page.getByRole('button', { name: 'Entrar' }).last().click()

  // Should redirect to dashboard (mocked)
  await expect(page).toHaveURL(/\/dashboard/)
})
