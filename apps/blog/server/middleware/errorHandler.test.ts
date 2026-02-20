import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describe, expect, it, vi } from 'vitest';
import { errorHandler } from './errorHandler';

const { errorMock } = vi.hoisted(() => ({
  errorMock: vi.fn(),
}));

vi.mock('../../modules/shared/logger', () => ({
  logger: {
    child: () => ({ error: errorMock }),
  },
}));

describe('errorHandler', () => {
  function createApp() {
    const app = new Hono();

    app.get('/http-exception', () => {
      throw new HTTPException(404, { message: 'Post not found' });
    });

    app.get('/unknown-error', () => {
      throw new Error('Something broke');
    });

    app.get('/custom-error', () => {
      const err = new Error('Sync failed');
      err.name = 'SyncError';
      throw err;
    });

    app.get('/http-exception-401', () => {
      throw new HTTPException(401, { message: 'Invalid or missing API key' });
    });

    app.onError(errorHandler);
    return app;
  }

  describe('HTTPException handling', () => {
    it('returns JSON response with the exception status and message', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/http-exception');

      const statusNotFound = 404;
      expect(res.status).toBe(statusNotFound);
      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Post not found',
        status: statusNotFound,
      });
      expect(body.error.timestamp).toBeDefined();
    });

    it('maps 401 status to UNAUTHORIZED code', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/http-exception-401');

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
        status: statusUnauthorized,
      });
    });
  });

  describe('unknown error handling', () => {
    it('returns 500 with generic message for non-HTTP errors', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/unknown-error');

      const statusInternalServerError = 500;
      expect(res.status).toBe(statusInternalServerError);
      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
        status: statusInternalServerError,
      });
      expect(body.error.timestamp).toBeDefined();
    });

    it('does not leak internal error details in the response', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/unknown-error');

      const body = await res.json();
      expect(body.error.message).not.toContain('Something broke');
    });
  });

  describe('error logging', () => {
    it('logs HTTPException at error level with status and path', async () => {
      const app = createApp();
      errorMock.mockClear();

      await app.request('/http-exception');

      expect(errorMock).toHaveBeenCalledOnce();
      const [logObj, logMessage] = errorMock.mock.calls[0];
      const statusNotFound = 404;
      expect(logObj).toMatchObject({
        status: statusNotFound,
        errorName: 'Error',
        path: '/http-exception',
      });
      expect(logObj.err).toBeInstanceOf(HTTPException);
      expect(logMessage).toBe('Post not found');
    });

    it('logs unknown errors at error level with 500 status', async () => {
      const app = createApp();
      errorMock.mockClear();

      await app.request('/unknown-error');

      expect(errorMock).toHaveBeenCalledOnce();
      const [logObj, logMessage] = errorMock.mock.calls[0];
      const statusInternalServerError = 500;
      expect(logObj).toMatchObject({
        status: statusInternalServerError,
        errorName: 'Error',
        path: '/unknown-error',
      });
      expect(logMessage).toBe('Internal Server Error');
    });

    it('logs custom error name for classification', async () => {
      const app = createApp();
      errorMock.mockClear();

      await app.request('/custom-error');

      const [logObj] = errorMock.mock.calls[0];
      expect(logObj.errorName).toBe('SyncError');
    });
  });

  describe('response format', () => {
    it('returns valid ISO 8601 timestamp', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/unknown-error');

      const body = await res.json();
      const parsed = new Date(body.error.timestamp);
      expect(parsed.toISOString()).toBe(body.error.timestamp);
    });

    it('returns application/json content type', async () => {
      const app = createApp();
      errorMock.mockClear();

      const res = await app.request('/unknown-error');

      expect(res.headers.get('content-type')).toContain('application/json');
    });
  });
});
