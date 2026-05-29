import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import { posts } from '../../../../../../infrastructure/drizzle/schema';
import type { Post, PostId, PostRepository } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { toDomain, toPersistence } from './mapper';

export class DrizzlePostRepository implements PostRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: PostId): Promise<Post | null> {
    try {
      const row = await this.db.query.posts.findFirst({
        where: eq(posts.uuid, id.getValue()),
        with: { author: true },
      });

      if (!row) {
        return null;
      }

      return toDomain(row);
    } catch (error) {
      throw new RepositoryError(
        `Failed to find post by ID: ${id.getValue()}`,
        error
      );
    }
  }

  async save(post: Post): Promise<void> {
    const data = toPersistence(post);

    try {
      await this.db
        .insert(posts)
        .values(data)
        .onConflictDoUpdate({
          target: posts.uuid,
          set: {
            title: data.title,
            content: data.content,
            type: data.type,
            excerpt: data.excerpt,
            imageUrl: data.imageUrl,
            slug: data.slug,
            status: data.status,
            category: data.category,
            tags: data.tags,
            releaseDate: data.releaseDate,
            revisionDate: data.revisionDate,
            updatedAt: data.updatedAt,
          },
        });
    } catch (error) {
      throw new RepositoryError(
        `Failed to save post: ${post.id.getValue()}`,
        error
      );
    }
  }

  async delete(id: PostId): Promise<void> {
    try {
      await this.db.delete(posts).where(eq(posts.uuid, id.getValue()));
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete post: ${id.getValue()}`,
        error
      );
    }
  }
}
