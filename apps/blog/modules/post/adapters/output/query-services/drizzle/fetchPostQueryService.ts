import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import { posts } from '../../../../../../infrastructure/drizzle/schema';
import type { PostId } from '../../../../domain';
import type {
  FetchPostQueryService,
  PostWithAuthor,
} from '../../../../use-cases/query/fetch-post/queryService';
import { RepositoryError } from '../../../shared';
import { toDomain } from '../../repositories/drizzle/mapper';

export class DrizzleFetchPostQueryService implements FetchPostQueryService {
  constructor(private readonly db: DrizzleClient) {}

  async fetchPost(id: PostId): Promise<PostWithAuthor | null> {
    try {
      const row = await this.db.query.posts.findFirst({
        where: eq(posts.uuid, id.getValue()),
        with: { author: true },
      });

      if (!row) {
        return null;
      }

      return {
        post: toDomain(row),
        author: row.author
          ? {
              id: row.author.uuid,
              name: row.author.name,
              avatarUrl: row.author.avatarUrl,
            }
          : null,
      };
    } catch (error) {
      throw new RepositoryError('Failed to fetch post', error);
    }
  }
}
