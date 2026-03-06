import type { PrismaClient } from '@prisma/client';
import type {
  FetchPostSummariesParams,
  FetchPostSummariesQueryService,
  FetchPostSummariesResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';

const POST_SUMMARY_SELECT = {
  uuid: true,
  title: true,
  excerpt: true,
  imageUrl: true,
  slug: true,
  category: true,
  releaseDate: true,
  author: {
    select: {
      uuid: true,
      name: true,
      avatarUrl: true,
    },
  },
} as const;

/**
 * Prisma implementation of FetchPostSummariesQueryService.
 * Fetches paginated post summaries (excludes content) from the database.
 */
export class PrismaFetchPostSummariesQueryService
  implements FetchPostSummariesQueryService
{
  constructor(private readonly prisma: PrismaClient) {}

  async fetchPostSummaries(
    params: FetchPostSummariesParams
  ): Promise<FetchPostSummariesResult> {
    try {
      const { page, pageSize, orderBy } = params;
      const skip = (page - 1) * pageSize;

      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          skip,
          take: pageSize,
          where: { type: 'ARTICLE' },
          orderBy: { releaseDate: orderBy },
          select: POST_SUMMARY_SELECT,
        }),
        this.prisma.post.count({ where: { type: 'ARTICLE' } }),
      ]);

      return {
        posts: posts.map((row) => ({
          id: row.uuid,
          title: row.title,
          excerpt: row.excerpt || null,
          imageUrl: row.imageUrl,
          slug: `${row.uuid}/${row.slug}`,
          category: row.category,
          author: row.author
            ? {
                id: row.author.uuid,
                name: row.author.name,
                avatarUrl: row.author.avatarUrl,
              }
            : null,
          releaseDate: row.releaseDate,
        })),
        totalCount,
      };
    } catch (error) {
      throw new RepositoryError('Failed to fetch post summaries', error);
    }
  }
}
