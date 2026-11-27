export type MachineState = 'online' | 'alerta' | 'offline';

const OFFLINE_AFTER_MILLISECONDS = 15 * 60 * 1000;

export function calculateMachineState(
  latestReadingAt: Date | null,
  now: Date = new Date(),
  hasActiveAlert = false,
): MachineState {
  if (!latestReadingAt || now.getTime() - latestReadingAt.getTime() > OFFLINE_AFTER_MILLISECONDS) {
    return 'offline';
  }

  return hasActiveAlert ? 'alerta' : 'online';
}

export interface MachineStatusRecord {
  id: string;
  localizacao: string;
  modelo: string;
  temperatura: number | null;
  estadoOperacional: string | null;
  produtos: unknown[];
  lotes: unknown[];
  ultimaAtualizacao: Date | null;
}

export interface MachineSummary {
  id: string;
  localizacao: string;
  modelo: string;
  estado: MachineState;
  ultimaAtualizacao: string | null;
}

export interface MachineDetails extends MachineSummary {
  temperatura: number | null;
  estadoOperacional: string | null;
  produtos: unknown[];
  lotes: unknown[];
  dadosAtuais: boolean;
}

export interface MachineStatusRepository {
  list(): Promise<MachineStatusRecord[]>;
  findById(id: string): Promise<MachineStatusRecord | null>;
}

export class MachineStatusService {
  constructor(
    private readonly machines: MachineStatusRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async list(state?: MachineState): Promise<MachineSummary[]> {
    const now = this.clock();
    const machines = await this.machines.list();

    return machines
      .map((machine) => this.toSummary(machine, now))
      .filter((machine) => state === undefined || machine.estado === state);
  }

  async getById(id: string): Promise<MachineDetails | null> {
    if (!isUuid(id)) return null;

    const machine = await this.machines.findById(id);
    if (!machine) return null;

    const now = this.clock();
    const state = calculateMachineState(machine.ultimaAtualizacao, now);
    return {
      ...this.toSummary(machine, now, state),
      temperatura: machine.temperatura,
      estadoOperacional: machine.estadoOperacional,
      produtos: machine.produtos,
      lotes: machine.lotes,
      dadosAtuais: state !== 'offline',
    };
  }

  private toSummary(
    machine: MachineStatusRecord,
    now: Date,
    state = calculateMachineState(machine.ultimaAtualizacao, now),
  ): MachineSummary {
    return {
      id: machine.id,
      localizacao: machine.localizacao,
      modelo: machine.modelo,
      estado: state,
      ultimaAtualizacao: machine.ultimaAtualizacao?.toISOString() ?? null,
    };
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
