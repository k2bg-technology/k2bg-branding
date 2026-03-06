import type { PrismaClient } from '@prisma/client';
import type {
  SearchPostSummariesParams,
  SearchPostSummariesQueryService,
  SearchPostSummariesResult,
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
 * Prisma implementation of SearchPostSummariesQueryService.
 * Searches post summaries by title (case-insensitive).
 */
export class PrismaSearchPostSummariesQueryService
  implements SearchPostSummariesQueryService
{
  constructor(private readonly prisma: PrismaClient) {}

  async searchPostSummaries(
    params: SearchPostSummariesParams
  ): Promise<SearchPostSummariesResult> {
    try {
      const { query, page, pageSize, orderBy } = params;
      const skip = (page - 1) * pageSize;

      const whereClause = {
        type: 'ARTICLE' as const,
        title: {
          contains: query,
          mode: 'insensitive' as const,
        },
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
        `Failed to search post summaries with query: ${params.query}`,
        error
      );
    }
  }
}
