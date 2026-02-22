import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { createSyncHeroImagesUseCase } from '../../infrastructure/di';
import { revalidateBlogPages } from '../lib/revalidation';
import { SyncImagesResponseSchema } from '../schemas/media';
import { ErrorResponseSchema } from '../schemas/shared';

const syncImagesRoute = createRoute({
  method: 'patch',
  path: '/images',
  summary: 'Sync hero images to CDN',
  security: [{ ApiKeyAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: SyncImagesResponseSchema } },
      description: 'Synced images',
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

const mediaRoutes = new OpenAPIHono();

mediaRoutes.openapi(syncImagesRoute, async (c) => {
  const result = await createSyncHeroImagesUseCase().execute();
  revalidateBlogPages();
  return c.json(result, 200);
});

export { mediaRoutes };
