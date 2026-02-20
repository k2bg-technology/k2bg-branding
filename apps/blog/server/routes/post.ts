import { Hono } from 'hono';
import { createSyncPostsFromExternalUseCase } from '../../infrastructure/di';

const postRoutes = new Hono();

postRoutes.patch('/posts', async (c) => {
  const result = await createSyncPostsFromExternalUseCase().execute();

  return c.json(result);
});

export { postRoutes };
