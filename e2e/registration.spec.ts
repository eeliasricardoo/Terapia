import { test, expect } from '@playwright/test';

test('registration flow with multi-step wizard', async ({ page }) => {
    await page.goto('/');

    // Click "Criar Conta" in Hero
    await page.getByRole('button', { name: 'Criar Conta' }).first().click();

    // Select "Cliente"
    await page.getByText('Cliente').click();

    // Should be on /cadastro/paciente
    await expect(page).toHaveURL(/\/cadastro\/paciente/);

    // --- STEP 1: Identification ---
    await expect(page.getByText('Identificação')).toBeVisible();
    await page.getByLabel('Cédula de Ciudadanía').fill('1234567890');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // --- STEP 2: Personal Details ---
    await expect(page.getByText('Dados Pessoais')).toBeVisible();

    // Fill rest of the form
    await page.getByLabel('Nome Completo').fill('Juan Perez');
    await page.getByLabel('Data de Nascimento').fill('1990-01-01');
    await page.getByLabel('Celular').fill('300 123 4567');
    await page.getByLabel('Email').fill('juan@example.com');
    await page.getByLabel(/^Senha/).fill('Password123!');
    await page.getByLabel('Confirmar Senha').fill('Password123!');
    await page.getByLabel('Aceito os Termos').check();

    // Submit
    await page.getByRole('button', { name: 'Criar Conta' }).click();

    // Check for redirection to Onboarding
    await expect(page).toHaveURL(/\/onboarding/);

    // --- Onboarding Step 1: Focus Areas ---
    await expect(page.getByText('Em quais áreas você gostaria de focar?')).toBeVisible();
    await page.getByRole('button', { name: 'Ansiedade' }).click();
    await page.waitForTimeout(500); // Wait for state update
    await page.getByRole('button', { name: 'Seguinte' }).click();

    // --- Onboarding Step 2: Specialist Preferences ---
    await expect(page.getByText('Passo 2 de 4')).toBeVisible();
    await expect(page.getByText('Tem alguma preferência para o seu especialista?')).toBeVisible();
    await page.getByRole('button', { name: 'Mulher' }).click();
    await page.getByRole('button', { name: 'Mais experiente' }).click();
    await page.getByRole('button', { name: 'Mais ouvinte' }).click();
    await page.getByRole('button', { name: 'Seguinte' }).click();

    // --- Onboarding Step 3 (Placeholder) ---
    await expect(page.getByText('Passo 3', { exact: true })).toBeVisible();
});
