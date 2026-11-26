import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app';

describe('API', () => {
  it('GET /api/health devolve ok', async () => {
    const app = buildApp();
    await app.ready();

    const res = await request(app.server).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});