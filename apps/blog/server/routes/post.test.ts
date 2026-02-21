import { Hono } from 'hono';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SyncPostsFromExternalOutput } from '../../modules/post/use-cases';
import { postRoutes } from './post';

vi.mock('../../infrastructure/di', () => ({
  createSyncPostsFromExternalUseCase: vi.fn(),
}));

import { createSyncPostsFromExternalUseCase } from '../../infrastructure/di';

const mockCreateUseCase = vi.mocked(createSyncPostsFromExternalUseCase);

function stubUseCaseWith(
  execute: Mock<() => Promise<SyncPostsFromExternalOutput>>
) {
  mockCreateUseCase.mockReturnValue({ execute } as unknown as ReturnType<
    typeof createSyncPostsFromExternalUseCase
  >);
}

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
      stubUseCaseWith(vi.fn().mockResolvedValue(syncResult));
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
      stubUseCaseWith(mockExecute);
      const app = createApp();

      await app.request('/posts', { method: 'PATCH' });

      expect(mockCreateUseCase).toHaveBeenCalledOnce();
      expect(mockExecute).toHaveBeenCalledOnce();
    });

    it('propagates use case errors', async () => {
      stubUseCaseWith(vi.fn().mockRejectedValue(new Error('Sync failed')));
      const app = createApp();

      const res = await app.request('/posts', { method: 'PATCH' });

      const statusInternalError = 500;
      expect(res.status).toBe(statusInternalError);
    });
  });
});
