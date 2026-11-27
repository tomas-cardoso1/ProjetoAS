import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { backendDirectory, createTestDatabase } from './support';

const sensorId = 'sensor-ct-01-1';
interface SensorSimulatorInstance {
  start(): Promise<void>;
  stop(): Promise<void>;
}

interface SensorSimulatorModule {
  SensorSimulator: new (brokerUrl: string, sensorIds: string[]) => SensorSimulatorInstance;
}

const backendRequire = createRequire(resolve(backendDirectory, 'package.json'));
const { SensorSimulator } = backendRequire(
  resolve(backendDirectory, 'dist/simulator.js'),
) as SensorSimulatorModule;
let simulator: SensorSimulatorInstance | undefined;

test.beforeAll(async () => {
  simulator = new SensorSimulator('mqtt://localhost:1883', [sensorId]);
  await simulator.start();
});

test.afterAll(async () => {
  await simulator?.stop();
});

test('CT-01.1 Registo com sucesso', async ({ page }) => {
  test.setTimeout(75_000);
  const database = createTestDatabase();
  const submittedAt = Date.now();

  try {
    await page.goto('/');
    await page.getByTestId('sensor-id').fill(sensorId);
    await page.getByTestId('machine-location').fill('Local de teste CT-01');
    await page.getByTestId('machine-model').fill('Modelo de teste CT-01');
    await page.getByTestId('customer-id').fill('cliente-ct-01');
    await page.getByTestId('register-machine').click();

    const result = page.getByTestId('registration-result');
    await expect(result).toContainText('Máquina registada.');
    await expect(result).toContainText('Estado: online.');

    const savedMachine = await database.query<{
      id: string;
      location: string;
      model: string;
      customer_id: string;
      sensor_id: string;
      twin_created: boolean;
    }>(
      `SELECT m.id::text AS id, m.location, m.model, m.customer_id, s.sensor_id,
              (dt.machine_id IS NOT NULL) AS twin_created
       FROM machines AS m
       JOIN sensor_associations AS s ON s.machine_id = m.id
       LEFT JOIN digital_twins AS dt ON dt.machine_id = m.id
       WHERE s.sensor_id = $1`,
      [sensorId],
    );

    expect(savedMachine.rows).toHaveLength(1);
    expect(savedMachine.rows[0]).toMatchObject({
      location: 'Local de teste CT-01',
      model: 'Modelo de teste CT-01',
      customer_id: 'cliente-ct-01',
      sensor_id: sensorId,
      twin_created: true,
    });

    const machineId = savedMachine.rows[0]?.id;
    expect(machineId).toBeTruthy();

    await expect
      .poll(
        async () => {
          const readings = await database.query<{
            source_timestamp: Date;
            temperature: number;
            operational_status: string;
            products: unknown[];
            lots: unknown[];
          }>(
            `SELECT source_timestamp, temperature, operational_status, products, lots
             FROM machine_readings
             WHERE machine_id = $1
             ORDER BY source_timestamp ASC
             LIMIT 1`,
            [machineId],
          );
          return readings.rows[0];
        },
        { timeout: 60_000, intervals: [250, 500, 1000] },
      )
      .toMatchObject({
        temperature: 6.5,
        operational_status: 'normal',
        products: [],
        lots: [],
      });

    const firstReading = await database.query<{ source_timestamp: Date }>(
      `SELECT source_timestamp
       FROM machine_readings
       WHERE machine_id = $1
       ORDER BY source_timestamp ASC
       LIMIT 1`,
      [machineId],
    );
    expect(firstReading.rows[0]?.source_timestamp).toBeInstanceOf(Date);
    expect(Date.now() - submittedAt).toBeLessThanOrEqual(60_000);
  } finally {
    await database.end();
  }
});
