import type { PrismaClient } from '@prisma/client';
import type {
  SearchPostsParams,
  SearchPostsQueryService,
  SearchPostsResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toDomain } from '../../repositories/prisma/mapper';

/**
 * Prisma implementation of SearchPostsQueryService.
 * Searches posts by title (case-insensitive).
 */
export class PrismaSearchPostsQueryService implements SearchPostsQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async searchPosts(params: SearchPostsParams): Promise<SearchPostsResult> {
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
        `Failed to search posts with query: ${params.query}`,
        error
      );
    }
  }
}
