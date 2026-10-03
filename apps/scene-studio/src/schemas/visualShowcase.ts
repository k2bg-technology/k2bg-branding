import { z } from 'zod';

export const visualShowcaseSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        mediaType: z.enum(['image', 'video']),
        src: z.string().min(1),
        durationInSeconds: z.number().min(2).max(30),
        startFromInSeconds: z.number().min(0).optional(),
        caption: z.string().min(1).optional(),
      })
    )
    .min(1),
  cta: z.string().min(1).optional(),
});

export type VisualShowcaseProps = z.infer<typeof visualShowcaseSchema>;
