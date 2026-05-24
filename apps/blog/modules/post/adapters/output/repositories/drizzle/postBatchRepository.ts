import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import {
  authors,
  posts as postsTable,
} from '../../../../../../infrastructure/drizzle/schema';
import type { Post } from '../../../../domain';
import type { PostBatchRepository } from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toPersistence } from './mapper';

// Stand-in author name written when sync encounters a post whose author UUID
// has not been seen before; matches the Prisma connectOrCreate fallback.
const UNKNOWN_AUTHOR_NAME = 'Unknown Author';

export class DrizzlePostBatchRepository implements PostBatchRepository {
  constructor(private readonly db: DrizzleClient) {}

  async upsertAll(posts: Post[]): Promise<void> {
    if (posts.length === 0) {
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        for (const post of posts) {
          const data = toPersistence(post);

          await tx
            .insert(authors)
            .values({
              uuid: data.authorId,
              name: UNKNOWN_AUTHOR_NAME,
              updatedAt: new Date(),
            })
            .onConflictDoNothing({ target: authors.uuid });

          await tx
            .insert(postsTable)
            .values(data)
            .onConflictDoUpdate({
              target: postsTable.uuid,
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
        }
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to upsert ${posts.length} posts`,
        error
      );
    }
  }
}
