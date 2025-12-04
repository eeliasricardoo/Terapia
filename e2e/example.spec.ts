import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Saúde Mental');
});
