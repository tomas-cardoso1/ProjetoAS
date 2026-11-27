import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { SensorUnavailableError } from './registration';
import type {
  MachineRegistrationInput,
  MachineRepository,
  SensorReading,
} from './registration';

export class PostgresMachineRepository implements MachineRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: MachineRegistrationInput): Promise<{ id: string }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const machineId = randomUUID();
      const machineResult = await client.query<{ id: string }>(
        `INSERT INTO machines (id, customer_id, location, model)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [machineId, input.clienteId, input.localizacao, input.modelo],
      );
      const insertedMachineId = machineResult.rows[0]?.id;
      if (!insertedMachineId) throw new Error('A base de dados não devolveu o identificador da máquina');

      try {
        await client.query(
          'INSERT INTO sensor_associations (sensor_id, machine_id) VALUES ($1, $2)',
          [input.sensorId, machineId],
        );
      } catch (error) {
        if (isUniqueViolation(error)) throw new SensorUnavailableError();
        throw error;
      }

      await client.query('INSERT INTO digital_twins (machine_id) VALUES ($1)', [machineId]);
      await client.query('COMMIT');
      return { id: machineId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async saveReading(sensorId: string, reading: SensorReading): Promise<void> {
    const result = await this.pool.query(
      `INSERT INTO machine_readings
         (machine_id, source_timestamp, temperature, operational_status, products, lots)
       SELECT machine_id, $2, $3, $4, $5::jsonb, $6::jsonb
       FROM sensor_associations
       WHERE sensor_id = $1`,
      [
        sensorId,
        reading.timestamp,
        reading.temperatura,
        reading.estadoOperacional,
        JSON.stringify(reading.produtos),
        JSON.stringify(reading.lotes),
      ],
    );

    if ((result.rowCount ?? 0) !== 1) {
      throw new Error(`Leitura recebida de sensor não associado: ${sensorId}`);
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}
