import { Hono } from 'hono';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SyncHeroImagesOutput } from '../../modules/post/use-cases';
import { mediaRoutes } from './media';

vi.mock('../../infrastructure/di', () => ({
  createSyncHeroImagesUseCase: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { createSyncHeroImagesUseCase } from '../../infrastructure/di';

const mockCreateUseCase = vi.mocked(createSyncHeroImagesUseCase);

function stubUseCaseWith(execute: Mock<() => Promise<SyncHeroImagesOutput>>) {
  mockCreateUseCase.mockReturnValue({ execute } as unknown as ReturnType<
    typeof createSyncHeroImagesUseCase
  >);
}

describe('mediaRoutes', () => {
  describe('PATCH /images', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    function createApp() {
      const app = new Hono();
      app.route('/', mediaRoutes);
      return app;
    }

    it('returns sync result from use case', async () => {
      const syncResult: SyncHeroImagesOutput = {
        uploadedImages: [{ id: 'img-1', url: 'https://example.com/img.jpg' }],
        count: 1,
        failedCount: 0,
      };
      stubUseCaseWith(vi.fn().mockResolvedValue(syncResult));
      const app = createApp();

      const res = await app.request('/images', { method: 'PATCH' });

      const statusOk = 200;
      expect(res.status).toBe(statusOk);
      const body = await res.json();
      expect(body).toEqual(syncResult);
    });

    it('calls createSyncHeroImagesUseCase and execute', async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        uploadedImages: [],
        count: 0,
        failedCount: 0,
      });
      stubUseCaseWith(mockExecute);
      const app = createApp();

      await app.request('/images', { method: 'PATCH' });

      expect(mockCreateUseCase).toHaveBeenCalledOnce();
      expect(mockExecute).toHaveBeenCalledOnce();
    });

    it('propagates use case errors', async () => {
      stubUseCaseWith(vi.fn().mockRejectedValue(new Error('Sync failed')));
      const app = createApp();

      const res = await app.request('/images', { method: 'PATCH' });

      const statusInternalError = 500;
      expect(res.status).toBe(statusInternalError);
    });
  });
});
