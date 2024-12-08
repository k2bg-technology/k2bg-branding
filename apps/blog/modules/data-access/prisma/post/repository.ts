import { Core } from '../core';
import { Category, Order, Post } from '../../../domain/post/types';
import { PostRepository as DomainPostRepository } from '../../../domain/post';
import { postSchema } from '../../../interfaces/post/validator';
import { authorSchema } from '../../../interfaces/author/validator';

export class PostRepository extends Core implements DomainPostRepository {
  async getAllArticles(orderBy: Order = 'desc') {
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
        id: post.uuid,
        title: post.title,
        content: post.content,
        type: post.type,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        slug: post.slug,
        status: post.status,
        category: post.category,
        tags: [],
        releaseDate: post.releaseDate,
        revisionDate: '',
        author: authorSchema.parse({
          id: post.author?.uuid,
          name: post.author?.name,
          avatarUrl: post.author?.avatarUrl,
        }),
      })
    );
  }

  async getAllArticleSlugs(orderBy: Order = 'desc') {
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

  async getArticlesCountByCategory(category: Category) {
    return this.prismaClient.post.count({
      where: {
        category,
        type: 'ARTICLE',
      },
    });
  }

  async getPaginatedArticlesByCategory(
    category: Category,
    pageSize: number,
    currentPage: number,
    orderBy: Order = 'desc'
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
        id: post.uuid,
        title: post.title,
        content: post.content,
        type: post.type,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        slug: post.slug,
        status: post.status,
        category: post.category,
        tags: [],
        releaseDate: post.releaseDate,
        revisionDate: '',
        author: authorSchema.parse({
          id: post.author?.uuid,
          name: post.author?.name,
          avatarUrl: post.author?.avatarUrl,
        }),
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
    orderBy: Order = 'desc'
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
        id: post.uuid,
        title: post.title,
        content: post.content,
        type: post.type,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        slug: post.slug,
        status: post.status,
        category: post.category,
        tags: [],
        releaseDate: post.releaseDate,
        revisionDate: '',
        author: authorSchema.parse({
          id: post.author?.uuid,
          name: post.author?.name,
          avatarUrl: post.author?.avatarUrl,
        }),
      })
    );
  }

  async getPost(id: Post['id']) {
    const post = await this.prismaClient.post.findUnique({
      where: {
        uuid: id,
      },
      include: {
        author: true,
      },
    });

    return postSchema.parse({
      id: post?.uuid,
      title: post?.title,
      content: post?.content,
      type: post?.type,
      excerpt: post?.excerpt,
      imageUrl: post?.imageUrl,
      slug: post?.slug,
      status: post?.status,
      category: post?.category,
      tags: [],
      releaseDate: post?.releaseDate,
      revisionDate: '',
      author: authorSchema.parse({
        id: post?.author?.uuid,
        name: post?.author?.name,
        avatarUrl: post?.author?.avatarUrl,
      }),
    });
  }

  async upsertAllPosts(posts: Post[]) {
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
