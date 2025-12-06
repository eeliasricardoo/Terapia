import { test, expect } from '@playwright/test';

test.skip('login flow for patient', async ({ page }) => {
    await page.goto('/');

    // Open Login Dialog (Desktop)
    await page.locator('.hidden.md\\:flex').getByRole('button', { name: 'Entrar' }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Check if dialog title is correct
    await expect(page.getByText('Como você deseja entrar?')).toBeVisible();

    // Click "Cliente"
    await page.getByText('Cliente').click();

    // Should be on /login/paciente
    await expect(page).toHaveURL(/\/login\/paciente/);

    // Check for Login Form
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();

    // Fill form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Senha').fill('password123');

    // Submit
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Should redirect to dashboard (mocked)
    await expect(page).toHaveURL(/\/dashboard/);
});
