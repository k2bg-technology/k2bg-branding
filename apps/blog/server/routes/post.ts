import { Hono } from 'hono';
import { createSyncPostsFromExternalUseCase } from '../../infrastructure/di';
import type { SyncPostsFromExternalOutput } from '../../modules/post/use-cases';

const postRoutes = new Hono();

postRoutes.patch('/posts', async (c) => {
  const result: SyncPostsFromExternalOutput =
    await createSyncPostsFromExternalUseCase().execute();

  return c.json(result);
});

export { postRoutes };
