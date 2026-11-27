import { expect, test } from '@playwright/test';
import { createTestDatabase } from './support';

const sensorId = 'sensor-ct-01-2';

test('CT-01.2 Máquina sem ligação', async ({ page }) => {
  const database = createTestDatabase();

  try {
    await page.goto('/');
    await page.getByTestId('sensor-id').fill(sensorId);
    await page.getByTestId('machine-location').fill('Local de teste CT-01.2');
    await page.getByTestId('machine-model').fill('Modelo de teste CT-01.2');
    await page.getByTestId('customer-id').fill('cliente-ct-01');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/machines') && response.request().method() === 'POST',
    );
    await page.getByTestId('register-machine').click();
    const response = await responsePromise;

    expect(response.status()).toBe(502);
    await expect(page.getByTestId('registration-error')).toHaveText('Falha de ligação ao sensor');

    const persistedRows = await database.query<{
      machines: string;
      associations: string;
      twins: string;
      readings: string;
    }>(
      `SELECT
         (SELECT count(*)::text FROM machines WHERE location = $2 AND model = $3) AS machines,
         (SELECT count(*)::text FROM sensor_associations WHERE sensor_id = $1) AS associations,
         (SELECT count(*)::text FROM digital_twins AS dt
          JOIN sensor_associations AS s ON s.machine_id = dt.machine_id
          WHERE s.sensor_id = $1) AS twins,
         (SELECT count(*)::text FROM machine_readings AS r
          JOIN sensor_associations AS s ON s.machine_id = r.machine_id
          WHERE s.sensor_id = $1) AS readings`,
      [sensorId, 'Local de teste CT-01.2', 'Modelo de teste CT-01.2'],
    );
    expect(persistedRows.rows[0]).toEqual({
      machines: '0',
      associations: '0',
      twins: '0',
      readings: '0',
    });
  } finally {
    await database.end();
  }
});
