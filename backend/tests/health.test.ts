import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app';
import { pool } from '../src/db';

describe('API', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/health devolve ok com a base de dados ligada', async () => {
    const app = buildApp();
    await app.ready();

    const res = await request(app.server).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'ok' });
  });
});
