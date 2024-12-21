import { z } from 'zod';

const mediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  width: z.number(),
  height: z.number(),
  sourceUrl: z.string().optional(),
  sourceFile: z.string().optional(),
  targetUrl: z.string().optional(),
});

export type MediaImage = z.infer<typeof mediaImageSchema>;

export const mediaImageSchema = mediaSchema
  .extend({
    extension: z.string(),
  })
  .refine((data) => data.sourceUrl || data.sourceFile, {
    message: 'sourceUrl or sourceFile is required',
  });

export type MediaVideo = z.infer<typeof mediaVideoSchema>;

export const mediaVideoSchema = mediaSchema.refine(
  (data) => data.sourceUrl || data.sourceFile,
  {
    message: 'sourceUrl or sourceFile is required',
  }
);
