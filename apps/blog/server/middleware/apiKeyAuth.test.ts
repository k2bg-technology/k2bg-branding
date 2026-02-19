import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiKeyAuth } from './apiKeyAuth';

describe('apiKeyAuth', () => {
  const validApiKey = 'test-api-key-123';

  beforeEach(() => {
    process.env.API_KEY = validApiKey;
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  function createApp() {
    const app = new Hono();
    app.use('/*', apiKeyAuth);
    app.get('/test', (c) => c.json({ message: 'ok' }));
    return app;
  }

  it('passes through when API key is valid', async () => {
    const app = createApp();

    const res = await app.request('/test', {
      headers: { 'x-api-key': validApiKey },
    });

    const statusOk = 200;
    expect(res.status).toBe(statusOk);
    const body = await res.json();
    expect(body).toEqual({ message: 'ok' });
  });

  it('returns 401 when API key is mismatched', async () => {
    const app = createApp();

    const res = await app.request('/test', {
      headers: { 'x-api-key': 'wrong-key' },
    });

    const statusUnauthorized = 401;
    expect(res.status).toBe(statusUnauthorized);
  });

  it('returns 401 when API key header is missing', async () => {
    const app = createApp();

    const res = await app.request('/test');

    const statusUnauthorized = 401;
    expect(res.status).toBe(statusUnauthorized);
  });
});
