import { z } from 'zod';

export type Author = z.infer<typeof authorSchema>;

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
});
