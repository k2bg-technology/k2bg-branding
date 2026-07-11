import { and, asc, count, desc, eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../../../../../infrastructure/drizzle/client';
import {
  authors,
  posts,
} from '../../../../../../infrastructure/drizzle/schema';
import type { Category } from '../../../../domain';
import type {
  FetchPostSummariesParams,
  FetchPostSummariesQueryService,
  FetchPostSummariesResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';

export class DrizzleFetchPostSummariesQueryService
  implements FetchPostSummariesQueryService
{
  constructor(private readonly db: DrizzleClient) {}

  async fetchPostSummaries(
    params: FetchPostSummariesParams
  ): Promise<FetchPostSummariesResult> {
    const { page, pageSize, orderBy } = params;
    const offset = (page - 1) * pageSize;
    const direction = orderBy === 'asc' ? asc : desc;
    const whereClause = params.status
      ? and(eq(posts.type, 'ARTICLE'), eq(posts.status, params.status))
      : eq(posts.type, 'ARTICLE');

    try {
      const [rows, totalRow] = await Promise.all([
        this.db
          .select({
            uuid: posts.uuid,
            title: posts.title,
            excerpt: posts.excerpt,
            imageUrl: posts.imageUrl,
            slug: posts.slug,
            category: posts.category,
            releaseDate: posts.releaseDate,
            authorUuid: authors.uuid,
            authorName: authors.name,
            authorAvatarUrl: authors.avatarUrl,
          })
          .from(posts)
          .leftJoin(authors, eq(posts.authorId, authors.uuid))
          .where(whereClause)
          .orderBy(direction(posts.releaseDate), direction(posts.uuid))
          .limit(pageSize)
          .offset(offset),
        this.db.select({ value: count() }).from(posts).where(whereClause),
      ]);

      return {
        posts: rows.map((row) => ({
          id: row.uuid,
          title: row.title,
          excerpt: row.excerpt || null,
          imageUrl: row.imageUrl,
          slug: `${row.uuid}/${row.slug}`,
          category: row.category as Category,
          author: row.authorUuid
            ? {
                id: row.authorUuid,
                name: row.authorName ?? '',
                avatarUrl: row.authorAvatarUrl,
              }
            : null,
          releaseDate: row.releaseDate,
        })),
        totalCount: totalRow[0]?.value ?? 0,
      };
    } catch (error) {
      throw new RepositoryError('Failed to fetch post summaries', error);
    }
  }
}
