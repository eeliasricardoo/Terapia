import { test, expect } from '@playwright/test';

test('registration flow with popup from Hero', async ({ page }) => {
    await page.goto('/');

    // Click "Criar Conta" in Hero (first one)
    await page.getByRole('button', { name: 'Criar Conta' }).first().click();

    // Check for Dialog
    await expect(page.getByText('Como você quer criar a sua conta?')).toBeVisible();

    // Click on "Cliente"
    await page.getByText('Cliente').click();

    // Should navigate to /cadastro/paciente
    await expect(page).toHaveURL(/\/cadastro\/paciente/);

    // Check if form elements are present
    await expect(page.getByLabel('Nome Completo')).toBeVisible();

    // Fill form with valid data (Colombia)
    await page.getByLabel('Nome Completo').fill('Juan Perez');
    await page.getByLabel('Cédula de Ciudadanía').fill('1234567890');
    await page.getByLabel('Data de Nascimento').fill('1990-01-01');
    await page.getByLabel('Celular').fill('300 123 4567');
    await page.getByLabel('Email').fill('juan@example.com');
    await page.getByLabel(/^Senha/).fill('Password123!');
    await page.getByLabel('Confirmar Senha').fill('Password123!');
    await page.getByLabel('Aceito os Termos').check();

    // Submit
    await page.getByRole('button', { name: 'Criar Conta' }).click();

    // TODO: Check for success message or redirection
});

test('registration flow with popup from Navbar', async ({ page }) => {
    await page.goto('/');

    // Click "Começar Agora" in Navbar
    await page.getByRole('button', { name: 'Começar Agora' }).first().click();

    // Check for Dialog
    await expect(page.getByText('Como você quer criar a sua conta?')).toBeVisible();

    // Click on "Cliente"
    await page.getByText('Cliente').click();

    // Should navigate to /cadastro/paciente
    await expect(page).toHaveURL(/\/cadastro\/paciente/);
});
