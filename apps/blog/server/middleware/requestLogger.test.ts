import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { requestLogger } from './requestLogger';

const { infoMock } = vi.hoisted(() => ({
  infoMock: vi.fn(),
}));

vi.mock('../../modules/shared/logger', () => ({
  logger: {
    child: () => ({ info: infoMock }),
  },
}));

describe('requestLogger', () => {
  function createApp() {
    const app = new Hono();
    app.use('/*', requestLogger);
    app.get('/test', (c) => c.json({ message: 'ok' }));
    app.get('/error', (c) => {
      const statusInternalServerError = 500;
      return c.json({ error: 'fail' }, statusInternalServerError);
    });
    return app;
  }

  it('logs request start with method and path', async () => {
    const app = createApp();
    infoMock.mockClear();

    await app.request('/test');

    const startCall = infoMock.mock.calls[0];
    expect(startCall[0]).toEqual({ method: 'GET', path: '/test' });
    expect(startCall[1]).toBe('Request started');
  });

  it('logs response completion with method, path, status, and duration', async () => {
    const app = createApp();
    infoMock.mockClear();

    await app.request('/test');

    const completeCall = infoMock.mock.calls[1];
    const statusOk = 200;
    expect(completeCall[0]).toMatchObject({
      method: 'GET',
      path: '/test',
      status: statusOk,
    });
    expect(completeCall[0].duration).toBeGreaterThanOrEqual(0);
    expect(completeCall[1]).toBe('Request completed');
  });

  it('logs correct status code for error responses', async () => {
    const app = createApp();
    infoMock.mockClear();

    await app.request('/error');

    const completeCall = infoMock.mock.calls[1];
    const statusInternalServerError = 500;
    expect(completeCall[0]).toMatchObject({
      method: 'GET',
      path: '/error',
      status: statusInternalServerError,
    });
  });

  it('logs POST method correctly', async () => {
    const app = createApp();
    app.post('/submit', (c) => c.json({ received: true }));
    infoMock.mockClear();

    await app.request('/submit', { method: 'POST' });

    const startCall = infoMock.mock.calls[0];
    expect(startCall[0]).toEqual({ method: 'POST', path: '/submit' });
  });
});
