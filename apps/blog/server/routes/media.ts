import { Hono } from 'hono';
import { createSyncHeroImagesUseCase } from '../../infrastructure/di';
import type { SyncHeroImagesOutput } from '../../modules/post/use-cases';

const mediaRoutes = new Hono();

mediaRoutes.patch('/images', async (c) => {
  const result: SyncHeroImagesOutput =
    await createSyncHeroImagesUseCase().execute();

  return c.json(result);
});

export { mediaRoutes };
