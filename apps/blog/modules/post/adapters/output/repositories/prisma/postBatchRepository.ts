import type { PrismaClient } from '@prisma/client';
import type { Post } from '../../../../domain';
import type { PostBatchRepository } from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toPersistence } from './mapper';

/**
 * Prisma implementation of PostBatchRepository.
 * Handles batch Post persistence operations using Prisma ORM.
 */
export class PrismaPostBatchRepository implements PostBatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertAll(posts: Post[]): Promise<void> {
    if (posts.length === 0) {
      return;
    }

    try {
      await this.prisma.$transaction(
        posts.map((post) => {
          const data = toPersistence(post);
          return this.prisma.post.upsert({
            where: { uuid: data.uuid },
            update: {
              title: data.title,
              content: data.content,
              type: data.type,
              excerpt: data.excerpt,
              imageUrl: data.imageUrl,
              slug: data.slug,
              status: data.status,
              category: data.category,
              tags: data.tags,
              releaseDate: data.releaseDate,
              revisionDate: data.revisionDate,
            },
            create: {
              uuid: data.uuid,
              title: data.title,
              content: data.content,
              type: data.type,
              excerpt: data.excerpt,
              imageUrl: data.imageUrl,
              slug: data.slug,
              status: data.status,
              category: data.category,
              tags: data.tags,
              releaseDate: data.releaseDate,
              revisionDate: data.revisionDate,
              author: {
                connectOrCreate: {
                  where: { uuid: data.authorId },
                  create: {
                    uuid: data.authorId,
                    name: 'Unknown Author',
                  },
                },
              },
            },
          });
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to upsert ${posts.length} posts`,
        error
      );
    }
  }
}
