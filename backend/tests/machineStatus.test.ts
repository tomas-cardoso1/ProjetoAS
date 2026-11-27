import { describe, expect, it } from 'vitest';
import { calculateMachineState } from '../src/machines/status';

const now = new Date('2026-11-27T12:00:00.000Z');

describe('BR-03 estado da máquina', () => {
  it('uma leitura de há 14 minutos dá Online', () => {
    const latestReadingAt = new Date(now.getTime() - 14 * 60 * 1000);

    expect(calculateMachineState(latestReadingAt, now)).toBe('online');
  });

  it('uma leitura de há 16 minutos dá Offline', () => {
    const latestReadingAt = new Date(now.getTime() - 16 * 60 * 1000);

    expect(calculateMachineState(latestReadingAt, now)).toBe('offline');
  });

  it('mantém Online no limite exato dos 15 minutos', () => {
    const latestReadingAt = new Date(now.getTime() - 15 * 60 * 1000);

    expect(calculateMachineState(latestReadingAt, now)).toBe('online');
  });

  it('dá prioridade a Offline sobre um alerta ativo', () => {
    const latestReadingAt = new Date(now.getTime() - 16 * 60 * 1000);

    expect(calculateMachineState(latestReadingAt, now, true)).toBe('offline');
  });
});
