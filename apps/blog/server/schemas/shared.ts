import { z } from '@hono/zod-openapi';

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      status: z.number(),
      timestamp: z.string(),
    }),
  })
  .openapi('ErrorResponse');
