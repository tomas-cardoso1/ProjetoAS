import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app';
import type { StockService } from '../src/stock/stock';

describe('GET /api/machines/:id/stock', () => {
  it('devolve 404 se a máquina não existir', async () => {
    const stockService = {
      getByMachineId: vi.fn().mockResolvedValue(null),
    } as unknown as StockService;
    const app = buildApp(undefined, undefined, stockService);

    await app.ready();
    try {
      const response = await request(app.server).get(
        '/api/machines/00000000-0000-4000-8000-000000009999/stock',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Máquina não encontrada' });
      expect(stockService.getByMachineId).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000009999',
        undefined,
        undefined,
      );
    } finally {
      await app.close();
    }
  });

  it('encaminha filtro e pesquisa ao serviço de stock', async () => {
    const stockService = {
      getByMachineId: vi.fn().mockResolvedValue(null),
    } as unknown as StockService;
    const app = buildApp(undefined, undefined, stockService);

    await app.ready();
    try {
      await request(app.server).get(
        '/api/machines/00000000-0000-4000-8000-000000000201/stock?filtro=expirado&q=Leite',
      );

      expect(stockService.getByMachineId).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000201',
        'expirado',
        'Leite',
      );
    } finally {
      await app.close();
    }
  });
});
