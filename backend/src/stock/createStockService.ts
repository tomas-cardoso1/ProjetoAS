import { pool } from '../db';
import { PostgresStockRepository } from './stockRepository';
import { StockService } from './stock';

export function createStockService(): StockService {
  return new StockService(new PostgresStockRepository(pool));
}
