import { expect, test } from '@playwright/test';

const offlineMachineId = '00000000-0000-4000-8000-000000000202';

test('CT-02.2 Máquina offline', async ({ page }) => {
  await page.goto('/');

  const machineSelector = page.getByTestId('machine-selector');
  await expect(machineSelector).toBeEnabled();
  await machineSelector.selectOption(offlineMachineId);

  await expect(page.getByTestId('machine-state')).toHaveText('Offline');
  await expect(page.getByTestId('machine-data-status')).toHaveText(
    'Últimos dados recebidos — não atuais',
  );
  await expect(page.getByTestId('machine-temperature')).toHaveText('7.2 °C');
  await expect(page.getByTestId('machine-operational-status')).toHaveText('normal');
  await expect(page.getByText('Última temperatura conhecida', { exact: true })).toBeVisible();
  await expect(page.getByText('Temperatura atual', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Estado operacional', { exact: true })).toHaveCount(0);

  const lastUpdated = page.getByTestId('machine-last-updated');
  await expect(lastUpdated).toBeVisible();
  await expect(lastUpdated).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T.*Z$/);
  const timestamp = await lastUpdated.getAttribute('datetime');
  expect(Date.now() - Date.parse(timestamp ?? '')).toBeGreaterThanOrEqual(16 * 60 * 1000);
});
