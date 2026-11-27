import Fastify from 'fastify';
import { pool } from './db';
import { createMachineRegistrationService } from './machines/createRegistrationService';
import { createMachineStatusService } from './machines/createMachineStatusService';
import { createStockService } from './stock/createStockService';
import {
  ClientNotFoundError,
  MachineRegistrationService,
  SensorUnavailableError,
  type MachineRegistrationInput,
} from './machines/registration';
import type { MachineState, MachineStatusService } from './machines/status';
import type { StockFilter, StockService } from './stock/stock';

export function buildApp(
  registrationService: MachineRegistrationService = createMachineRegistrationService(),
  machineStatusService: MachineStatusService = createMachineStatusService(),
  stockService: StockService = createStockService(),
) {
  const app = Fastify();

  app.get('/api/health', async (_req, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ok', db: 'ok' };
    } catch {
      return reply.code(503).send({ status: 'erro', db: 'indisponivel' });
    }
  });

  app.post<{ Body: MachineRegistrationInput }>(
    '/api/machines',
    {
      schema: {
        body: {
          type: 'object',
          required: ['sensorId', 'localizacao', 'modelo', 'clienteId'],
          properties: {
            sensorId: { type: 'string' },
            localizacao: { type: 'string' },
            modelo: { type: 'string' },
            clienteId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await registrationService.register(request.body);
        return reply.code(201).send(result);
      } catch (error) {
        if (error instanceof ClientNotFoundError) {
          return reply.code(400).send({ message: error.message });
        }

        if (error instanceof SensorUnavailableError) {
          return reply.code(502).send({ message: 'Falha de ligação ao sensor' });
        }

        throw error;
      }
    },
  );

  app.get<{ Querystring: { estado?: MachineState } }>(
    '/api/machines',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            estado: { type: 'string', enum: ['online', 'alerta', 'offline'] },
          },
        },
      },
    },
    async (request) => machineStatusService.list(request.query.estado),
  );

  app.get<{ Params: { id: string } }>('/api/machines/:id', async (request, reply) => {
    const machine = await machineStatusService.getById(request.params.id);
    if (!machine) return reply.code(404).send({ message: 'Máquina não encontrada' });
    return machine;
  });

  app.get<{
    Params: { id: string };
    Querystring: { filtro?: StockFilter; q?: string };
  }>(
    '/api/machines/:id/stock',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            filtro: { type: 'string', enum: ['stock-baixo', 'perto-validade', 'expirado'] },
            q: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const stock = await stockService.getByMachineId(
        request.params.id,
        request.query.filtro,
        request.query.q,
      );
      if (!stock) return reply.code(404).send({ message: 'Máquina não encontrada' });
      return stock;
    },
  );

  return app;
}
