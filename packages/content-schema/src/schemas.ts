import { z } from 'zod';
import { validateCrossReferences } from './crossReferences';
import {
  AffiliateType,
  Category,
  EmbedType,
  MediaType,
  PostStatus,
  PostType,
} from './enums';

export const CONTENT_BUNDLE_FORMAT_VERSION = 1;

export const postTypeSchema = z.enum(PostType);
export const postStatusSchema = z.enum(PostStatus);
export const categorySchema = z.enum(Category);
export const embedTypeSchema = z.enum(EmbedType);
export const mediaTypeSchema = z.enum(MediaType);
export const affiliateTypeSchema = z.enum(AffiliateType);

const uuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const postSchema = z.strictObject({
  id: uuidSchema,
  title: z.string().min(1).max(100),
  type: postTypeSchema,
  status: postStatusSchema,
  slug: slugSchema.max(100),
  excerpt: z.string().max(500),
  category: categorySchema,
  tags: z.array(z.string().min(1).max(10)).max(20),
  author: z.string().optional(),
  releaseDate: z.iso.date(),
  revisionDate: z.iso.date(),
  heroImage: z.url().startsWith('https://').optional(),
  content: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type Post = z.infer<typeof postSchema>;

export const mediaSchema = z
  .strictObject({
    id: uuidSchema,
    type: mediaTypeSchema,
    name: z.string().min(1),
    sourceFile: z.url().optional(),
    sourceUrl: z.url().optional(),
    targetUrl: z.url().optional(),
    width: z.int().positive(),
    height: z.int().positive(),
    extension: z
      .enum([
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'bmp',
        'ico',
        'avif',
        'mp4',
        'webm',
        'ogg',
        'mov',
        'avi',
      ])
      .optional(),
  })
  .refine(
    (media) => media.sourceFile !== undefined || media.sourceUrl !== undefined,
    {
      path: ['sourceUrl'],
      message: 'At least one of sourceFile or sourceUrl is required',
    }
  );

export type Media = z.infer<typeof mediaSchema>;

const affiliateFields = {
  id: uuidSchema,
  name: z.string().min(1),
  targetUrl: z.url(),
  provider: z.string().min(1).max(50),
};
const imageSchema = z.strictObject({
  src: z.url(),
  width: z.int().positive(),
  height: z.int().positive(),
});
const providerColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

export const affiliateSchema = z.discriminatedUnion('type', [
  z.strictObject({
    ...affiliateFields,
    type: z.literal(AffiliateType.BANNER),
    image: imageSchema,
  }),
  z.strictObject({
    ...affiliateFields,
    type: z.literal(AffiliateType.PRODUCT),
    image: imageSchema,
    providerColor: providerColorSchema,
    imageProvider: z.string().min(1).max(50),
    subProviders: z.array(uuidSchema),
  }),
  z.strictObject({ ...affiliateFields, type: z.literal(AffiliateType.TEXT) }),
  z.strictObject({
    ...affiliateFields,
    type: z.literal(AffiliateType.SUB_PROVIDER),
    providerColor: providerColorSchema,
  }),
]);

export type Affiliate = z.infer<typeof affiliateSchema>;

export const authorSchema = z.strictObject({
  id: uuidSchema,
  name: z.string().min(1),
  avatarUrl: z.url().optional(),
});

export type Author = z.infer<typeof authorSchema>;

export const authorsSchema = z.record(slugSchema.min(1), authorSchema);

export type Authors = z.infer<typeof authorsSchema>;

const bundleShapeSchema = z.strictObject({
  formatVersion: z.literal(CONTENT_BUNDLE_FORMAT_VERSION),
  locale: z.literal('ja'),
  posts: z.array(
    postSchema.refine((post) => post.type === PostType.ARTICLE, {
      path: ['type'],
      message: 'posts accepts only ARTICLE items',
    })
  ),
  pages: z.array(
    postSchema.refine((page) => page.type === PostType.PAGE, {
      path: ['type'],
      message: 'pages accepts only PAGE items',
    })
  ),
  media: z.array(mediaSchema),
  affiliates: z.array(affiliateSchema),
  authors: authorsSchema,
});

export type ContentBundle = z.infer<typeof bundleShapeSchema>;

export const contentBundleSchema = bundleShapeSchema.superRefine(
  validateCrossReferences
);
