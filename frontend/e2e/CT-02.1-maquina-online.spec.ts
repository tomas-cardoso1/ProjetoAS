import { expect, test } from '@playwright/test';

const onlineMachineId = '00000000-0000-4000-8000-000000000201';

test('CT-02.1 Máquina online', async ({ page }) => {
  await page.goto('/');

  const machineSelector = page.getByTestId('machine-selector');
  await expect(machineSelector).toBeEnabled();
  await machineSelector.selectOption(onlineMachineId);

  await expect(page.getByTestId('machine-state')).toHaveText('Online');
  await expect(page.getByTestId('machine-data-status')).toHaveText('Dados atuais');
  await expect(page.getByTestId('machine-temperature')).toHaveText('6.5 °C');
  await expect(page.getByTestId('machine-operational-status')).toHaveText('normal');

  const lastUpdated = page.getByTestId('machine-last-updated');
  await expect(lastUpdated).toBeVisible();
  await expect(lastUpdated).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T.*Z$/);
});
