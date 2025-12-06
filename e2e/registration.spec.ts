import { test, expect } from '@playwright/test';

test.skip('registration flow with multi-step wizard', async ({ page }) => {
    await page.goto('/');

    // Click "Criar Conta" in Hero
    await page.getByRole('button', { name: 'Criar Conta' }).first().click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

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

    // --- Onboarding Step 3: Availability ---
    await expect(page.getByText('Qual sua disponibilidade?')).toBeVisible();
    // Wait for animation/render
    await page.waitForTimeout(500);

    // Select days (using text to avoid ambiguity if any)
    await page.getByText('Seg', { exact: true }).click();
    await page.getByText('Qua', { exact: true }).click();

    // Select time
    await page.getByRole('button', { name: 'Noite' }).click();

    await page.getByRole('button', { name: 'Seguinte' }).click();

    // --- Onboarding Step 4: History ---
    await expect(page.getByText('Conte-nos um pouco sobre seu histórico')).toBeVisible();

    // Wait for animation/render
    await page.waitForTimeout(500);

    // Select options. Using nth-match or specific text if possible.
    // "Sim" for previous therapy
    await page.locator('button:has-text("Sim")').first().click();

    // "Não" for medication (it's the second group of Sim/Não)
    // We can scope by the heading to be safer
    const medicationSection = page.locator('div').filter({ hasText: 'Toma alguma medicação?' });
    await medicationSection.getByRole('button', { name: 'Não' }).click();

    await page.getByPlaceholder('Sinta-se à vontade para escrever...').fill('Teste de bio');

    // Finish
    await page.getByRole('button', { name: 'Finalizar' }).click();
});
