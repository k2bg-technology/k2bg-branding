import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { revalidateTag } from 'next/cache';
import { revalidateBlogPages, revalidateBlogPath } from '../lib/revalidation';
import {
  RevalidateRequestSchema,
  RevalidateResponseSchema,
} from '../schemas/revalidation';
import { ErrorResponseSchema } from '../schemas/shared';

const revalidateRoute = createRoute({
  method: 'post',
  path: '/revalidate',
  summary: 'Trigger on-demand cache revalidation for blog pages',
  description:
    'Revalidates all blog pages by default. Optionally specify a path or tag for granular revalidation.',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: RevalidateRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: RevalidateResponseSchema } },
      description: 'Revalidation triggered',
    },
    401: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Unauthorized',
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Revalidation failed',
    },
  },
});

const revalidationRoutes = new OpenAPIHono();

revalidationRoutes.openapi(revalidateRoute, async (c) => {
  const { path, tag } = c.req.valid('json');

  if (tag) {
    revalidateTag(tag);
  } else if (path) {
    revalidateBlogPath(path);
  } else {
    revalidateBlogPages();
  }

  return c.json({ revalidated: true, now: Date.now() }, 200);
});

export { revalidationRoutes };
