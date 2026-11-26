import Fastify from 'fastify';
import { pool } from './db';

export function buildApp() {
  const app = Fastify();

  app.get('/api/health', async (_req, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ok', db: 'ok' };
    } catch {
      return reply.code(503).send({ status: 'erro', db: 'indisponivel' });
    }
  });

  return app;
}
