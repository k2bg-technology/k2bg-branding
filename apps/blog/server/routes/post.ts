import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { createSyncPostsFromExternalUseCase } from '../../infrastructure/di';
import { SyncPostsResponseSchema } from '../schemas/post';
import { ErrorResponseSchema } from '../schemas/shared';

const syncPostsRoute = createRoute({
  method: 'patch',
  path: '/posts',
  summary: 'Sync posts from Notion to database',
  security: [{ ApiKeyAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: SyncPostsResponseSchema } },
      description: 'Synced posts',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Sync failed',
    },
  },
});

const postRoutes = new OpenAPIHono();

postRoutes.openapi(syncPostsRoute, async (c) => {
  const result = await createSyncPostsFromExternalUseCase().execute();
  return c.json(result, 200);
});

export { postRoutes };
