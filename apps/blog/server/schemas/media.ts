import { z } from '@hono/zod-openapi';

export const SyncImagesResponseSchema = z
  .object({
    uploadedImages: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
      })
    ),
    count: z.number(),
    failedCount: z.number(),
  })
  .openapi('SyncImagesResponse');
