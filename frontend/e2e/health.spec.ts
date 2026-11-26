import { test, expect } from '@playwright/test';

test('mostra que a API e a base de dados estão OK', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('estado-api')).toHaveText('API e base de dados OK');
});
