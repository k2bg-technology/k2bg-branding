import { z } from '@hono/zod-openapi';

const AuthorOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

const CategorySchema = z.enum([
  'ENGINEERING',
  'DESIGN',
  'DATA_SCIENCE',
  'LIFE_STYLE',
  'OTHER',
]);

const PostOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  excerpt: z.string().nullable(),
  imageUrl: z.string(),
  ogImageUrl: z.string().nullable(),
  slug: z.string(),
  status: z.string(),
  category: CategorySchema,
  tags: z.array(z.string()).readonly(),
  authorId: z.string(),
  author: AuthorOutputSchema.nullable(),
  releaseDate: z.string(),
  revisionDate: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const SyncPostsResponseSchema = z
  .object({
    syncedPosts: z.array(PostOutputSchema),
    count: z.number(),
  })
  .openapi('SyncPostsResponse');
