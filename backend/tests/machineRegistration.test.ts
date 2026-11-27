import { describe, expect, it, vi } from 'vitest';
import {
  MachineRegistrationService,
  SensorUnavailableError,
  type CustomerRepository,
  type MachineRepository,
  type SensorIntegration,
} from '../src/machines/registration';

describe('BR-01', () => {
  it('não persiste a máquina quando a ligação ao sensor falha', async () => {
    const customers: CustomerRepository = {
      exists: vi.fn().mockResolvedValue(true),
    };
    const machines: MachineRepository = {
      create: vi.fn().mockResolvedValue({ id: 'machine-test' }),
      saveReading: vi.fn().mockResolvedValue(undefined),
    };
    const sensors: SensorIntegration = {
      associate: vi.fn(async () => {
        throw new SensorUnavailableError();
      }),
    };
    const service = new MachineRegistrationService(customers, machines, sensors);

    await expect(
      service.register({
        sensorId: 'sensor-offline',
        localizacao: 'Local de teste',
        modelo: 'Modelo de teste',
        clienteId: 'cliente-ct-01',
      }),
    ).rejects.toBeInstanceOf(SensorUnavailableError);

    expect(machines.create).not.toHaveBeenCalled();
    expect(machines.saveReading).not.toHaveBeenCalled();
  });
});
