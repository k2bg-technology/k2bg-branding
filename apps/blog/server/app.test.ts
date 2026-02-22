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

vi.mock('../modules/shared/logger', () => ({
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
      expect(infoMock).toHaveBeenCalledWith(
        { method: 'PATCH', path: '/api/posts' },
        'Request started'
      );
    });

    it('logs completion even for rejected requests', async () => {
      await app.request('/api/posts', { method: 'PATCH' });

      const completionCall = infoMock.mock.calls.find(
        (call) => call[1] === 'Request completed'
      );
      expect(completionCall).toBeDefined();
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

    it('allows requests with valid API key', async () => {
      stubPostUseCaseWith({ syncedPosts: [], count: 0 });

      const res = await app.request('/api/posts', {
        method: 'PATCH',
        headers: authedHeaders(),
      });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
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
      expect(body.error.timestamp).toBeDefined();
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
      expect(body.paths['/api/posts']).toBeDefined();
      expect(body.paths['/api/posts'].patch).toBeDefined();
      expect(body.paths['/api/images']).toBeDefined();
      expect(body.paths['/api/images'].patch).toBeDefined();
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
