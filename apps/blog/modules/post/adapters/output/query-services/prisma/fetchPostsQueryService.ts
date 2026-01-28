import type { PrismaClient } from '@prisma/client';
import type {
  FetchPostsParams,
  FetchPostsQueryService,
  FetchPostsResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toDomain } from '../../repositories/prisma/mapper';

/**
 * Prisma implementation of FetchPostsQueryService.
 * Fetches paginated posts from the database.
 */
export class PrismaFetchPostsQueryService implements FetchPostsQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async fetchPosts(params: FetchPostsParams): Promise<FetchPostsResult> {
    try {
      const { page, pageSize, orderBy } = params;
      const skip = (page - 1) * pageSize;

      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          skip,
          take: pageSize,
          where: { type: 'ARTICLE' },
          orderBy: { releaseDate: orderBy },
          include: { author: true },
        }),
        this.prisma.post.count({ where: { type: 'ARTICLE' } }),
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
      throw new RepositoryError('Failed to fetch posts', error);
    }
  }
}
