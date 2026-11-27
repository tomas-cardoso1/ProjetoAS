import type { Pool } from 'pg';
import type { CustomerRepository } from './registration';

export class PostgresCustomerRepository implements CustomerRepository {
  constructor(private readonly pool: Pool) {}

  async exists(clienteId: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM customers WHERE id = $1', [clienteId]);
    return (result.rowCount ?? 0) > 0;
  }
}
