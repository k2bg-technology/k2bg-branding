import type { Post } from '../../domain';
import type { OgImageUrlGenerator } from './ogImageUrlGenerator';
import type { AuthorOutput, PostOutput } from './types';

/**
 * Maps Post entity to PostOutput DTO
 */
export function toPostOutput(
  post: Post,
  author: AuthorOutput | null = null,
  ogImageUrlGenerator?: OgImageUrlGenerator
): PostOutput {
  const id = post.id.getValue();

  return {
    id,
    title: post.title.getValue(),
    content: post.content.getValue(),
    type: post.type,
    excerpt: post.excerpt.hasValue() ? post.excerpt.getValue() : null,
    imageUrl: post.imageUrl.getValue(),
    ogImageUrl: ogImageUrlGenerator ? ogImageUrlGenerator.generate(id) : null,
    slug: `${id}/${post.slug.getValue()}`,
    status: post.status,
    category: post.category,
    tags: post.tags.getValues(),
    authorId: post.authorId.getValue(),
    author,
    releaseDate: post.releaseDate.toISOString(),
    revisionDate: post.revisionDate.toISOString(),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    deletedAt: post.deletedAt,
  };
}
