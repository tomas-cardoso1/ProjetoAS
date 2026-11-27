import { expect, test } from '@playwright/test';

const onlineMachineId = '00000000-0000-4000-8000-000000000201';

test('CT-03.1 Consulta do stock e validades', async ({ page }) => {
  const startedAt = Date.now();
  await page.goto('/');

  const machineSelector = page.getByTestId('machine-selector');
  await expect(machineSelector).toBeEnabled({ timeout: 3000 });
  await machineSelector.selectOption(onlineMachineId);

  const product = page.getByTestId('stock-product').filter({ hasText: 'Leite com Chocolate' });
  await expect(product).toBeVisible({ timeout: 3000 });
  expect(Date.now() - startedAt).toBeLessThanOrEqual(3000);

  await expect(product.getByTestId('stock-product-name')).toHaveText('Leite com Chocolate');
  await expect(product.getByTestId('stock-quantity')).toHaveText('10');
  await expect(product.getByTestId('stock-capacity')).toHaveText('20');

  const lots = product.getByTestId('stock-lot');
  await expect(lots).toHaveCount(2);
  await expect(lots.nth(0).getByTestId('stock-lot-days')).toHaveText('5 dias');
  await expect(lots.nth(1).getByTestId('stock-lot-days')).toHaveText('18 dias');
});
