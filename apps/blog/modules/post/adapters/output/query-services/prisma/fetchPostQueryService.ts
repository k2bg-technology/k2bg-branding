import type { PrismaClient } from '@prisma/client';
import type { PostId } from '../../../../domain';
import type {
  FetchPostQueryService,
  PostWithAuthor,
} from '../../../../use-cases/query/fetch-post/queryService';
import { RepositoryError } from '../../../shared';
import { toDomain } from '../../repositories/prisma/mapper';

/**
 * Prisma implementation of FetchPostQueryService.
 * Fetches a single post with author from the database.
 */
export class PrismaFetchPostQueryService implements FetchPostQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async fetchPost(id: PostId): Promise<PostWithAuthor | null> {
    try {
      const prismaPost = await this.prisma.post.findUnique({
        where: { uuid: id.getValue() },
        include: { author: true },
      });

      if (!prismaPost) {
        return null;
      }

      return {
        post: toDomain(prismaPost),
        author: prismaPost.author
          ? {
              id: prismaPost.author.uuid,
              name: prismaPost.author.name,
              avatarUrl: prismaPost.author.avatarUrl,
            }
          : null,
      };
    } catch (error) {
      throw new RepositoryError('Failed to fetch post', error);
    }
  }
}
