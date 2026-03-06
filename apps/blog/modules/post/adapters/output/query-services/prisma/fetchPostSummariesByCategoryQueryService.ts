import type { PrismaClient } from '@prisma/client';
import type {
  FetchPostSummariesByCategoryParams,
  FetchPostSummariesByCategoryQueryService,
  FetchPostSummariesByCategoryResult,
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
 * Prisma implementation of FetchPostSummariesByCategoryQueryService.
 * Fetches paginated post summaries filtered by category.
 */
export class PrismaFetchPostSummariesByCategoryQueryService
  implements FetchPostSummariesByCategoryQueryService
{
  constructor(private readonly prisma: PrismaClient) {}

  async fetchPostSummariesByCategory(
    params: FetchPostSummariesByCategoryParams
  ): Promise<FetchPostSummariesByCategoryResult> {
    try {
      const { category, page, pageSize, orderBy } = params;
      const skip = (page - 1) * pageSize;

      const whereClause = {
        type: 'ARTICLE' as const,
        category: category,
      };

      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          skip,
          take: pageSize,
          where: whereClause,
          orderBy: { releaseDate: orderBy },
          select: POST_SUMMARY_SELECT,
        }),
        this.prisma.post.count({ where: whereClause }),
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
      throw new RepositoryError(
        `Failed to fetch post summaries by category: ${params.category}`,
        error
      );
    }
  }
}
