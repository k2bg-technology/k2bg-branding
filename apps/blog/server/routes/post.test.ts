import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postRoutes } from './post';

vi.mock('../../infrastructure/di', () => ({
  createSyncPostsFromExternalUseCase: vi.fn(),
}));

import { createSyncPostsFromExternalUseCase } from '../../infrastructure/di';

const mockCreateUseCase = vi.mocked(createSyncPostsFromExternalUseCase);

describe('postRoutes', () => {
  describe('PATCH /posts', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    function createApp() {
      const app = new Hono();
      app.route('/', postRoutes);
      return app;
    }

    it('returns sync result from use case', async () => {
      const syncResult = {
        syncedPosts: [{ id: 'post-1', title: 'Test Post' }],
        count: 1,
      };
      mockCreateUseCase.mockReturnValue({
        execute: vi.fn().mockResolvedValue(syncResult),
      } as never);
      const app = createApp();

      const res = await app.request('/posts', { method: 'PATCH' });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body).toEqual(syncResult);
    });

    it('calls createSyncPostsFromExternalUseCase and execute', async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        syncedPosts: [],
        count: 0,
      });
      mockCreateUseCase.mockReturnValue({
        execute: mockExecute,
      } as never);
      const app = createApp();

      await app.request('/posts', { method: 'PATCH' });

      expect(mockCreateUseCase).toHaveBeenCalledOnce();
      expect(mockExecute).toHaveBeenCalledOnce();
    });

    it('propagates use case errors', async () => {
      mockCreateUseCase.mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error('Sync failed')),
      } as never);
      const app = createApp();

      const res = await app.request('/posts', { method: 'PATCH' });

      const statusInternalError = 500;
      expect(res.status).toBe(statusInternalError);
    });
  });
});
