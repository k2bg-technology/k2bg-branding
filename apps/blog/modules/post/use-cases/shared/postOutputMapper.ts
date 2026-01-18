import type { Post } from '../../domain';
import type { PostOutput } from './types';

/**
 * Maps Post entity to PostOutput DTO
 */
export function toPostOutput(post: Post): PostOutput {
  return {
    id: post.id.getValue(),
    title: post.title.getValue(),
    content: post.content.getValue(),
    type: post.type,
    excerpt: post.excerpt.hasValue() ? post.excerpt.getValue() : null,
    imageUrl: post.imageUrl.getValue(),
    slug: post.slug.getValue(),
    status: post.status,
    category: post.category,
    tags: post.tags.getValues(),
    authorId: post.authorId.getValue(),
    releaseDate: post.releaseDate.toISOString(),
    revisionDate: post.revisionDate.toISOString(),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    deletedAt: post.deletedAt,
  };
}
