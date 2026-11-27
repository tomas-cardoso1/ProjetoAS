import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pool } from './db';

async function resetDatabase(): Promise<void> {
  const schema = await readFile(resolve(__dirname, '../db/schema.sql'), 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query(
      'TRUNCATE TABLE machine_readings, digital_twins, sensor_associations, machines, customers RESTART IDENTITY CASCADE',
    );
    await client.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [
      'cliente-ct-01',
      'Cliente de teste CT-01',
    ]);
    const onlineMachineId = '00000000-0000-4000-8000-000000000201';
    const offlineMachineId = '00000000-0000-4000-8000-000000000202';
    const seededAt = Date.now();
    const validityDateAfterDays = (days: number): string => {
      const date = new Date(seededAt);
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    };
    const stockProducts = [
      {
        produtoId: 'leite-com-chocolate',
        nome: 'Leite com Chocolate',
        unidades: 10,
        capacidadeMaxima: 20,
        stockMinimo: 5,
      },
      {
        produtoId: 'sumo-de-laranja',
        nome: 'Sumo de Laranja',
        unidades: 8,
        capacidadeMaxima: 16,
        stockMinimo: 4,
      },
    ];
    const stockLots = [
      { produtoId: 'leite-com-chocolate', validade: validityDateAfterDays(5) },
      { produtoId: 'leite-com-chocolate', validade: validityDateAfterDays(18) },
      { produtoId: 'sumo-de-laranja', validade: validityDateAfterDays(-1) },
    ];

    await client.query(
      `INSERT INTO machines (id, customer_id, location, model)
       VALUES ($1, $2, $3, $4), ($5, $2, $6, $7)`,
      [
        onlineMachineId,
        'cliente-ct-01',
        'Local de teste CT-02.1',
        'Modelo de teste CT-02.1',
        offlineMachineId,
        'Local de teste CT-02.2',
        'Modelo de teste CT-02.2',
      ],
    );
    await client.query(
      `INSERT INTO sensor_associations (sensor_id, machine_id)
       VALUES ($1, $2), ($3, $4)`,
      ['sensor-ct-02-1', onlineMachineId, 'sensor-ct-02-2', offlineMachineId],
    );
    await client.query(
      'INSERT INTO digital_twins (machine_id) VALUES ($1), ($2)',
      [onlineMachineId, offlineMachineId],
    );
    await client.query(
      `INSERT INTO machine_readings
         (machine_id, source_timestamp, temperature, operational_status, products, lots)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb),
              ($7, $8, $9, $10, $11::jsonb, $12::jsonb)`,
      [
        onlineMachineId,
        new Date(seededAt - 2 * 60 * 1000),
        6.5,
        'normal',
        JSON.stringify(stockProducts),
        JSON.stringify(stockLots),
        offlineMachineId,
        new Date(seededAt - 16 * 60 * 1000),
        7.2,
        'normal',
        '[]',
        '[]',
      ],
    );
    await client.query('COMMIT');
    console.log('Esquema aplicado e dados de teste repostos.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch((error: unknown) => {
  console.error('Não foi possível repor a base de dados:', error);
  process.exitCode = 1;
});
