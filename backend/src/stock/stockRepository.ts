import type { Pool } from 'pg';
import type { MachineStockRecord, StockRepository } from './stock';

interface MachineStockRow {
  maquinaId: string;
  ultimaAtualizacao: Date | null;
  produtos: unknown;
  lotes: unknown;
}

export class PostgresStockRepository implements StockRepository {
  constructor(private readonly pool: Pool) {}

  async findByMachineId(id: string): Promise<MachineStockRecord | null> {
    const result = await this.pool.query<MachineStockRow>(
      `SELECT m.id::text AS "maquinaId",
              r.source_timestamp AS "ultimaAtualizacao",
              COALESCE(r.products, '[]'::jsonb) AS produtos,
              COALESCE(r.lots, '[]'::jsonb) AS lotes
       FROM machines AS m
       LEFT JOIN LATERAL (
         SELECT source_timestamp, products, lots
         FROM machine_readings
         WHERE machine_id = m.id
         ORDER BY source_timestamp DESC, id DESC
         LIMIT 1
       ) AS r ON TRUE
       WHERE m.id = $1`,
      [id],
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      maquinaId: row.maquinaId,
      ultimaAtualizacao: row.ultimaAtualizacao,
      produtos: Array.isArray(row.produtos) ? row.produtos : [],
      lotes: Array.isArray(row.lotes) ? row.lotes : [],
    };
  }
}
