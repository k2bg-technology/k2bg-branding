import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSyncHeroImagesUseCase,
  createSyncPostsFromExternalUseCase,
} from '../infrastructure/di';

import { app } from './app';

const { infoMock, errorMock } = vi.hoisted(() => ({
  infoMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock('logger', () => ({
  logger: {
    child: () => ({ info: infoMock, error: errorMock }),
  },
}));

vi.mock('../infrastructure/di', () => ({
  createSyncPostsFromExternalUseCase: vi.fn(),
  createSyncHeroImagesUseCase: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const mockCreatePostUseCase = vi.mocked(createSyncPostsFromExternalUseCase);
const mockCreateMediaUseCase = vi.mocked(createSyncHeroImagesUseCase);

function stubPostUseCaseWith(result: unknown) {
  mockCreatePostUseCase.mockReturnValue({
    execute: vi.fn().mockResolvedValue(result),
  } as unknown as ReturnType<typeof createSyncPostsFromExternalUseCase>);
}

function stubMediaUseCaseWith(result: unknown) {
  mockCreateMediaUseCase.mockReturnValue({
    execute: vi.fn().mockResolvedValue(result),
  } as unknown as ReturnType<typeof createSyncHeroImagesUseCase>);
}

const validApiKey = 'test-api-key-123';

function authedHeaders(): HeadersInit {
  return { 'x-api-key': validApiKey };
}

describe('OpenAPIHono app composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = validApiKey;
  });

  describe('middleware order', () => {
    it('runs requestLogger before apiKeyAuth (logs unauthorized requests)', async () => {
      const res = await app.request('/api/posts', { method: 'PATCH' });

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
      expect(infoMock.mock.calls[0][0]).toEqual({
        method: 'PATCH',
        path: '/api/posts',
      });
    });

    it('logs completion even for rejected requests', async () => {
      const res = await app.request('/api/posts', { method: 'PATCH' });

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
      expect(infoMock.mock.calls[1][0]).toMatchObject({
        method: 'PATCH',
        path: '/api/posts',
        status: statusUnauthorized,
      });
      expect(infoMock.mock.calls[1][0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('authentication', () => {
    it('returns 401 without API key', async () => {
      const res = await app.request('/api/posts', { method: 'PATCH' });

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
    });

    it('returns 401 with invalid API key', async () => {
      const res = await app.request('/api/posts', {
        method: 'PATCH',
        headers: { 'x-api-key': 'wrong-key' },
      });

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
    });

    it('rejects an unmounted path without an API key (default-deny before routing)', async () => {
      const res = await app.request('/api/does-not-exist', { method: 'GET' });

      const statusUnauthorized = 401;
      expect(res.status).toBe(statusUnauthorized);
    });
  });

  describe('route mounting', () => {
    it('routes PATCH /api/posts to postRoutes', async () => {
      const syncResult = { syncedPosts: [{ id: 'p-1' }], count: 1 };
      stubPostUseCaseWith(syncResult);

      const res = await app.request('/api/posts', {
        method: 'PATCH',
        headers: authedHeaders(),
      });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body).toEqual(syncResult);
    });

    it('routes PATCH /api/images to mediaRoutes', async () => {
      const syncResult = {
        uploadedImages: [{ id: 'img-1' }],
        count: 1,
        failedCount: 0,
      };
      stubMediaUseCaseWith(syncResult);

      const res = await app.request('/api/images', {
        method: 'PATCH',
        headers: authedHeaders(),
      });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body).toEqual(syncResult);
    });

    it('returns 404 for unregistered paths', async () => {
      const res = await app.request('/api/unknown', {
        method: 'GET',
        headers: authedHeaders(),
      });

      const statusNotFound = 404;
      expect(res.status).toBe(statusNotFound);
    });
  });

  describe('error handling', () => {
    it('returns structured JSON error when route throws', async () => {
      mockCreatePostUseCase.mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error('DB connection lost')),
      } as unknown as ReturnType<typeof createSyncPostsFromExternalUseCase>);

      const res = await app.request('/api/posts', {
        method: 'PATCH',
        headers: authedHeaders(),
      });

      const statusInternalServerError = 500;
      expect(res.status).toBe(statusInternalServerError);
      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
        status: statusInternalServerError,
      });
      expect(new Date(body.error.timestamp).toISOString()).toBe(
        body.error.timestamp
      );
    });

    it('returns structured JSON for auth errors via errorHandler', async () => {
      const res = await app.request('/api/posts', { method: 'PATCH' });

      const body = await res.json();
      expect(body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      });
    });
  });

  describe('OpenAPI documentation (non-production only)', () => {
    it('serves OpenAPI spec at /api/doc.json without authentication', async () => {
      const res = await app.request('/api/doc.json', { method: 'GET' });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body.openapi).toBe('3.1.0');
      expect(body.info.title).toBe('K2BG Blog API');
    });

    it('includes both PATCH endpoints in the spec', async () => {
      const res = await app.request('/api/doc.json', { method: 'GET' });

      const body = await res.json();
      expect(body.paths['/api/posts'].patch).toMatchObject({
        summary: 'Sync posts from Notion to database',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'Synced posts' },
          401: { description: 'Unauthorized' },
          500: { description: 'Sync failed' },
        },
      });
      expect(body.paths['/api/images'].patch).toMatchObject({
        summary: 'Sync hero images to CDN',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'Synced images' },
          401: { description: 'Unauthorized' },
          500: { description: 'Sync failed' },
        },
      });
    });

    it('includes ApiKeyAuth security scheme', async () => {
      const res = await app.request('/api/doc.json', { method: 'GET' });

      const body = await res.json();
      expect(body.components.securitySchemes.ApiKeyAuth).toMatchObject({
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      });
    });
  });

  describe('Swagger UI (non-production only)', () => {
    it('serves Swagger UI at /api/doc without authentication', async () => {
      const res = await app.request('/api/doc', { method: 'GET' });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const contentType = res.headers.get('content-type');
      expect(contentType).toContain('text/html');
    });
  });
});
