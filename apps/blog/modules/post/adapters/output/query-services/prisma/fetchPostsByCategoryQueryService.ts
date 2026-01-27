import type { PrismaClient } from '@prisma/client';
import type {
  FetchPostsByCategoryParams,
  FetchPostsByCategoryQueryService,
  FetchPostsByCategoryResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toDomain } from '../../repositories/prisma/mapper';

/**
 * Prisma implementation of FetchPostsByCategoryQueryService.
 * Fetches paginated posts filtered by category.
 */
export class PrismaFetchPostsByCategoryQueryService
  implements FetchPostsByCategoryQueryService
{
  constructor(private readonly prisma: PrismaClient) {}

  async fetchPostsByCategory(
    params: FetchPostsByCategoryParams
  ): Promise<FetchPostsByCategoryResult> {
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
          include: { author: true },
        }),
        this.prisma.post.count({ where: whereClause }),
      ]);

      return {
        posts: posts.map((prismaPost) => ({
          post: toDomain(prismaPost),
          author: prismaPost.author
            ? {
                id: prismaPost.author.uuid,
                name: prismaPost.author.name,
                avatarUrl: prismaPost.author.avatarUrl,
              }
            : null,
        })),
        totalCount,
      };
    } catch (error) {
      throw new RepositoryError(
        `Failed to fetch posts by category: ${params.category}`,
        error
      );
    }
  }
}
