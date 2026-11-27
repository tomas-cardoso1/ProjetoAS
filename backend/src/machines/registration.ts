export interface MachineRegistrationInput {
  sensorId: string;
  localizacao: string;
  modelo: string;
  clienteId: string;
}

export interface MachineRegistrationResult {
  id: string;
  estado: 'online';
}

export interface SensorReading {
  timestamp: string;
  temperatura: number;
  estadoOperacional: string;
  produtos: unknown[];
  lotes: unknown[];
}

export interface SensorAssociation {
  activate(): void;
  close(): Promise<void>;
}

export interface SensorIntegration {
  associate(
    sensorId: string,
    onReading: (reading: SensorReading) => Promise<void>,
  ): Promise<SensorAssociation>;
}

export interface CustomerRepository {
  exists(clienteId: string): Promise<boolean>;
}

export interface MachineRepository {
  create(input: MachineRegistrationInput): Promise<{ id: string }>;
  saveReading(sensorId: string, reading: SensorReading): Promise<void>;
}

export class ClientNotFoundError extends Error {
  constructor() {
    super('Cliente não encontrado');
    this.name = 'ClientNotFoundError';
  }
}

export class SensorUnavailableError extends Error {
  constructor() {
    super('Falha de ligação ao sensor');
    this.name = 'SensorUnavailableError';
  }
}

export class MachineRegistrationService {
  constructor(
    private readonly customers: CustomerRepository,
    private readonly machines: MachineRepository,
    private readonly sensors: SensorIntegration,
  ) {}

  async register(input: MachineRegistrationInput): Promise<MachineRegistrationResult> {
    if (!(await this.customers.exists(input.clienteId))) {
      throw new ClientNotFoundError();
    }

    const association = await this.sensors.associate(input.sensorId, (reading) =>
      this.machines.saveReading(input.sensorId, reading),
    );

    try {
      const machine = await this.machines.create(input);
      association.activate();
      return { id: machine.id, estado: 'online' };
    } catch (error) {
      await association.close();
      throw error;
    }
  }
}
