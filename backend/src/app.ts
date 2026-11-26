import Fastify from 'fastify';

export function buildApp() {
  const app = Fastify();

  app.get('/api/health', async () => ({ status: 'ok' }));

  return app;
}