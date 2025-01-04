import { Core } from '../core';
import * as Domain from '../../../domain';
import { postSchema } from '../../../interfaces/post/validator';
import { authorSchema } from '../../../interfaces/author/validator';

export class Repository extends Core implements Domain.Post.OutputRepository {
  async getAllArticles(orderBy: Domain.Post.Order = 'desc') {
    const posts = await this.prismaClient.post.findMany({
      orderBy: {
        releaseDate: orderBy,
      },
      where: {
        type: 'ARTICLE',
      },
      include: {
        author: true,
      },
    });

    return posts.map((post) =>
      postSchema.parse({
        ...Core.objectIdToUuid(post),
        author: authorSchema.parse(Core.objectIdToUuid(post.author)),
      })
    );
  }

  async getAllArticleSlugs(orderBy: Domain.Post.Order = 'desc') {
    const posts = await this.prismaClient.post.findMany({
      orderBy: {
        releaseDate: orderBy,
      },
      where: {
        type: 'ARTICLE',
      },
      select: {
        uuid: true,
        slug: true,
      },
    });

    return posts.map((post) =>
      postSchema
        .pick({
          id: true,
          slug: true,
        })
        .parse({
          id: post.uuid,
          slug: post.slug,
        })
    );
  }

  async getArticlesCountByCategory(category: Domain.Post.Category) {
    return this.prismaClient.post.count({
      where: {
        category,
        type: 'ARTICLE',
      },
    });
  }

  async getPaginatedArticlesByCategory(
    category: Domain.Post.Category,
    pageSize: number,
    currentPage: number,
    orderBy: Domain.Post.Order = 'desc'
  ) {
    const posts = await this.prismaClient.post.findMany({
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      where: {
        category,
        type: 'ARTICLE',
      },
      include: {
        author: true,
      },
      orderBy: {
        releaseDate: orderBy,
      },
    });

    return posts.map((post) =>
      postSchema.parse({
        ...Core.objectIdToUuid(post),
        author: authorSchema.parse(Core.objectIdToUuid(post.author)),
      })
    );
  }

  async getArticlesCountByQueryString(queryString: string) {
    return this.prismaClient.post.count({
      where: {
        title: {
          contains: queryString,
        },
        type: 'ARTICLE',
      },
    });
  }

  async getPaginatedArticlesByQueryString(
    queryString: string,
    pageSize: number,
    currentPage: number,
    orderBy: Domain.Post.Order = 'desc'
  ) {
    const posts = await this.prismaClient.post.findMany({
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      where: {
        title: {
          contains: queryString,
        },
        type: 'ARTICLE',
      },
      include: {
        author: true,
      },
      orderBy: {
        releaseDate: orderBy,
      },
    });

    return posts.map((post) =>
      postSchema.parse({
        ...Core.objectIdToUuid(post),
        author: authorSchema.parse(Core.objectIdToUuid(post.author)),
      })
    );
  }

  async getPost(id: Domain.Post.Post['id']) {
    const post = await this.prismaClient.post.findUnique({
      where: {
        uuid: id,
      },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return postSchema.parse({
      ...Core.objectIdToUuid(post),
      author: authorSchema.parse(Core.objectIdToUuid(post.author)),
    });
  }

  async upsertAllPosts(posts: Domain.Post.Post[]) {
    await this.prismaClient.$transaction(
      posts.map(({ id, ...post }) => {
        const postPayload = {
          uuid: id,
          ...post,
          ...(post.author && {
            author: {
              connectOrCreate: {
                where: {
                  uuid: post.author.id,
                },
                create: {
                  uuid: post.author.id,
                  name: post.author.name,
                  avatarUrl: post.author.avatarUrl,
                },
              },
            },
          }),
        };

        return this.prismaClient.post.upsert({
          where: { uuid: id },
          update: postPayload,
          create: postPayload,
        });
      })
    );
  }
}
