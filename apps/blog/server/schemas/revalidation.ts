import { z } from '@hono/zod-openapi';

export const RevalidateRequestSchema = z
  .object({
    path: z
      .string()
      .optional()
      .openapi({ description: 'Specific path to revalidate (e.g. "/blog")' }),
    tag: z
      .string()
      .optional()
      .openapi({ description: 'Cache tag to revalidate' }),
  })
  .openapi('RevalidateRequest');

export const RevalidateResponseSchema = z
  .object({
    revalidated: z.boolean(),
    now: z.number(),
  })
  .openapi('RevalidateResponse');
