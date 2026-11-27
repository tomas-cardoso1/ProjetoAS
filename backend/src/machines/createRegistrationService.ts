import { pool } from '../db';
import { MqttSensorIntegration } from '../iot/sensorIntegration';
import { PostgresCustomerRepository } from './customerRepository';
import { PostgresMachineRepository } from './machineRepository';
import { MachineRegistrationService } from './registration';

export function createMachineRegistrationService(): MachineRegistrationService {
  const customers = new PostgresCustomerRepository(pool);
  const machines = new PostgresMachineRepository(pool);
  const sensors = new MqttSensorIntegration();
  return new MachineRegistrationService(customers, machines, sensors);
}
