import type { PrismaClient } from '@prisma/client';
import type { Post, PostId, PostRepository } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { toDomain, toPersistence } from './mapper';

/**
 * Prisma implementation of PostRepository.
 * Handles Post persistence operations using Prisma ORM.
 */
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: PostId): Promise<Post | null> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { uuid: id.getValue() },
        include: { author: true },
      });

      if (!post) {
        return null;
      }

      return toDomain(post);
    } catch (error) {
      throw new RepositoryError(
        `Failed to find post by ID: ${id.getValue()}`,
        error
      );
    }
  }

  async save(post: Post): Promise<void> {
    try {
      const data = toPersistence(post);

      await this.prisma.post.upsert({
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
            connect: { uuid: data.authorId },
          },
        },
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to save post: ${post.id.getValue()}`,
        error
      );
    }
  }

  async delete(id: PostId): Promise<void> {
    try {
      await this.prisma.post.delete({
        where: { uuid: id.getValue() },
      });
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete post: ${id.getValue()}`,
        error
      );
    }
  }
}
