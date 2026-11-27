import type { Pool } from 'pg';
import type { MachineStatusRecord, MachineStatusRepository } from './status';

interface MachineStatusRow {
  id: string;
  localizacao: string;
  modelo: string;
  temperatura: number | null;
  estadoOperacional: string | null;
  produtos: unknown[] | null;
  lotes: unknown[] | null;
  ultimaAtualizacao: Date | null;
}

export class PostgresMachineStatusRepository implements MachineStatusRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<MachineStatusRecord[]> {
    const result = await this.pool.query<MachineStatusRow>(
      `${machineStatusSelect}
       ORDER BY m.location ASC, m.id ASC`,
    );

    return result.rows.map(toMachineStatusRecord);
  }

  async findById(id: string): Promise<MachineStatusRecord | null> {
    const result = await this.pool.query<MachineStatusRow>(
      `${machineStatusSelect}
       WHERE m.id = $1`,
      [id],
    );

    const row = result.rows[0];
    return row ? toMachineStatusRecord(row) : null;
  }
}

const machineStatusSelect = `
  SELECT m.id::text AS id,
         m.location AS localizacao,
         m.model AS modelo,
         r.temperature AS temperatura,
         r.operational_status AS "estadoOperacional",
         r.products AS produtos,
         r.lots AS lotes,
         r.source_timestamp AS "ultimaAtualizacao"
  FROM machines AS m
  LEFT JOIN LATERAL (
    SELECT source_timestamp, temperature, operational_status, products, lots
    FROM machine_readings
    WHERE machine_id = m.id
    ORDER BY source_timestamp DESC, id DESC
    LIMIT 1
  ) AS r ON TRUE`;

function toMachineStatusRecord(row: MachineStatusRow): MachineStatusRecord {
  return {
    ...row,
    produtos: row.produtos ?? [],
    lotes: row.lotes ?? [],
  };
}
