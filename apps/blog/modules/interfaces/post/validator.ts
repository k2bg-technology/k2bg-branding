import { z } from 'zod';

import { Category, Status, Type } from '../../domain/post/types';
import { authorSchema } from '../author/validator';

export type Post = z.infer<typeof postSchema>;

export const postSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    type: z.enum(Type),
    excerpt: z.string(),
    imageUrl: z.string(),
    slug: z.string(),
    status: z.enum(Status),
    category: z.enum(Category),
    tags: z.array(z.string()),
    releaseDate: z.string(),
    revisionDate: z.string(),
  })
  .extend({
    author: authorSchema,
  });
