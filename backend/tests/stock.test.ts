import { describe, expect, it } from 'vitest';
import {
  calculateDaysRemaining,
  calculateLotExpiryState,
  calculateProductStockState,
  StockService,
  type MachineStockRecord,
  type StockRepository,
} from '../src/stock/stock';

const now = new Date('2026-11-27T12:00:00.000Z');

describe('BR-04 estado do stock', () => {
  it('unidades abaixo do mínimo dão Stock baixo', () => {
    expect(calculateProductStockState(4, 5)).toBe('Stock baixo');
  });

  it('zero unidades dão Esgotado', () => {
    expect(calculateProductStockState(0, 5)).toBe('Esgotado');
  });
});

describe('BR-05 estado da validade', () => {
  it('uma validade a 7 dias dá Perto da validade', () => {
    const daysRemaining = calculateDaysRemaining('2026-12-04', now);

    expect(daysRemaining).toBe(7);
    expect(calculateLotExpiryState(daysRemaining)).toBe('Perto da validade');
  });

  it('uma validade passada dá Expirado', () => {
    const daysRemaining = calculateDaysRemaining('2026-11-26', now);

    expect(daysRemaining).toBe(-1);
    expect(calculateLotExpiryState(daysRemaining)).toBe('Expirado');
  });
});

describe('UC-03.S2 filtros e pesquisa de stock', () => {
  const machineId = '00000000-0000-4000-8000-000000000201';
  const record: MachineStockRecord = {
    maquinaId: machineId,
    ultimaAtualizacao: now,
    produtos: [
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
    ],
    lotes: [
      { produtoId: 'leite-com-chocolate', validade: '2026-11-26' },
      { produtoId: 'leite-com-chocolate', validade: '2026-12-15' },
      { produtoId: 'sumo-de-laranja', validade: '2026-11-30' },
    ],
  };

  function createService(latestReadingAt = now): StockService {
    const repository: StockRepository = {
      async findByMachineId(id) {
        return id === machineId ? { ...record, ultimaAtualizacao: latestReadingAt } : null;
      },
    };
    return new StockService(repository, () => now);
  }

  it('filtrar por expirado devolve apenas lotes expirados', async () => {
    const stock = await createService().getByMachineId(machineId, 'expirado');

    expect(stock?.produtos).toHaveLength(1);
    expect(stock?.produtos[0]?.nome).toBe('Leite com Chocolate');
    expect(stock?.produtos[0]?.lotes).toHaveLength(1);
    expect(stock?.produtos[0]?.lotes[0]?.estado).toBe('Expirado');
    expect(stock?.produtos[0]?.lotes[0]?.avisoRemocaoObrigatoria).toBe('Remoção obrigatória');
  });

  it('pesquisar Leite devolve só produtos com esse nome', async () => {
    const stock = await createService().getByMachineId(machineId, undefined, 'Leite');

    expect(stock?.produtos.map((product) => product.nome)).toEqual(['Leite com Chocolate']);
  });

  it('combina o filtro de lotes expirados com a pesquisa pelo nome', async () => {
    const stock = await createService().getByMachineId(machineId, 'expirado', 'Leite');

    expect(stock?.produtos).toHaveLength(1);
    expect(stock?.produtos[0]?.nome).toBe('Leite com Chocolate');
    expect(stock?.produtos[0]?.lotes.map((lot) => lot.estado)).toEqual(['Expirado']);
  });

  it('assinala o último stock como não atual depois de 15 minutos', async () => {
    const lastReading = new Date(now.getTime() - 16 * 60 * 1000);
    const stock = await createService(lastReading).getByMachineId(machineId);

    expect(stock?.dadosAtuais).toBe(false);
    expect(stock?.ultimaAtualizacao).toBe(lastReading.toISOString());
    expect(stock?.produtos).toHaveLength(2);
  });
});
