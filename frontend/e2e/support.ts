import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
export const backendDirectory = resolve(currentDirectory, '../../backend');

interface QueryResult<TRow> {
  rows: TRow[];
}

export interface TestDatabase {
  query<TRow = Record<string, unknown>>(
    query: string,
    values?: unknown[],
  ): Promise<QueryResult<TRow>>;
  end(): Promise<void>;
}

interface PgModule {
  Pool: new (configuration: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }) => TestDatabase;
}

const backendRequire = createRequire(resolve(backendDirectory, 'package.json'));
const { Pool } = backendRequire('pg') as PgModule;

export function createTestDatabase(): TestDatabase {
  return new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'godseye',
    password: process.env.DB_PASSWORD ?? 'godseye',
    database: process.env.DB_NAME ?? 'godseye',
  });
}
