import { and, asc, desc, eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import { posts } from '../../../../../../infrastructure/drizzle/schema';
import type {
  FetchAllSlugsParams,
  FetchAllSlugsQueryService,
  SlugRecord,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';

export class DrizzleFetchAllSlugsQueryService
  implements FetchAllSlugsQueryService
{
  constructor(private readonly db: DrizzleClient) {}

  async fetchAllSlugs(params: FetchAllSlugsParams): Promise<SlugRecord[]> {
    const direction = params.orderBy === 'asc' ? asc : desc;

    try {
      const rows = await this.db
        .select({
          uuid: posts.uuid,
          slug: posts.slug,
          revisionDate: posts.revisionDate,
        })
        .from(posts)
        .where(and(eq(posts.type, 'ARTICLE'), eq(posts.status, 'PUBLISHED')))
        .orderBy(direction(posts.releaseDate));

      return rows.map((row) => ({
        id: row.uuid,
        slug: row.slug,
        revisionDate: row.revisionDate,
      }));
    } catch (error) {
      throw new RepositoryError('Failed to fetch all slugs', error);
    }
  }
}
