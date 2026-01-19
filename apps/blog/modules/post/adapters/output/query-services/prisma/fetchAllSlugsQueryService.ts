import type { PrismaClient } from '@prisma/client';
import type {
  FetchAllSlugsParams,
  FetchAllSlugsQueryService,
  SlugRecord,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';

/**
 * Prisma implementation of FetchAllSlugsQueryService.
 * Fetches all post slugs for static site generation.
 */
export class PrismaFetchAllSlugsQueryService
  implements FetchAllSlugsQueryService
{
  constructor(private readonly prisma: PrismaClient) {}

  async fetchAllSlugs(params: FetchAllSlugsParams): Promise<SlugRecord[]> {
    try {
      const posts = await this.prisma.post.findMany({
        where: { type: 'ARTICLE' },
        orderBy: { releaseDate: params.orderBy },
        select: { uuid: true, slug: true },
      });

      return posts.map((post) => ({
        id: post.uuid,
        slug: post.slug,
      }));
    } catch (error) {
      throw new RepositoryError('Failed to fetch all slugs', error);
    }
  }
}
