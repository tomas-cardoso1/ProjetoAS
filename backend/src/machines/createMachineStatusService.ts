import { pool } from '../db';
import { PostgresMachineStatusRepository } from './machineStatusRepository';
import { MachineStatusService } from './status';

export function createMachineStatusService(): MachineStatusService {
  return new MachineStatusService(new PostgresMachineStatusRepository(pool));
}
