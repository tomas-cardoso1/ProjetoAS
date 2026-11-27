import { expect, test } from '@playwright/test';

const onlineMachineId = '00000000-0000-4000-8000-000000000201';

test('CT-03.2 Lote expirado', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('machine-selector').selectOption(onlineMachineId);

  const product = page.getByTestId('stock-product').filter({ hasText: 'Sumo de Laranja' });
  await expect(product).toBeVisible({ timeout: 3000 });

  const lot = product.getByTestId('stock-lot');
  await expect(lot).toHaveCount(1);
  await expect(lot).toHaveClass(/expiry-state--expired/);
  await expect(lot.getByTestId('stock-lot-days')).toHaveText('-1 dia');
  await expect(lot.getByTestId('stock-lot-state')).toHaveText('Expirado');
  await expect(lot).toHaveCSS('color', 'rgb(163, 38, 38)');
  await expect(lot.getByTestId('stock-lot-removal-warning')).toHaveText('Remoção obrigatória');
});
