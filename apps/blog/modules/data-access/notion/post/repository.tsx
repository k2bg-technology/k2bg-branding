import type * as Domain from '../../../domain';
import type { Order } from '../../../domain/post/types';
import { postSchema } from '../../../interfaces/post/validator';
import { Core } from '../core';
import { Page } from '../page';

import { Entity } from './entity';

const DATABASE_ID = process.env.NOTION_POST_DATABASE_ID ?? '';

export class Repository extends Core implements Domain.Post.InputRepository {
  async getAllPosts(orderBy: Order = 'desc') {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'status',
            status: {
              equals: 'PUBLISHED',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'releaseDate',
          direction: orderBy === 'asc' ? 'ascending' : 'descending',
        },
      ],
    });

    const posts = await Promise.all(
      database.results.map(async (result) => {
        const notionPage = new Page(result);
        const post = new Entity(notionPage);
        const markdownString = await this.generateMarkdownString(post.id);

        return postSchema.parse({
          ...post.toObject(),
          // TODO: Implement tags
          tags: [],
          content: markdownString,
        });
      })
    );

    return posts;
  }

  async getAllHeroImageSources() {
    const database = await this.fetchDatabase({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'status',
            status: {
              equals: 'PUBLISHED',
            },
          },
        ],
      },
    });

    const heroImages = database.results
      .map((result) => {
        const notionPage = new Page(result);
        const post = new Entity(notionPage);

        if (!post.imageUrl) return null;

        return {
          id: post.id,
          url: post.imageUrl,
        };
      })
      .filter((post) => !!post);

    return heroImages;
  }

  async generateMarkdownString(pageId: string) {
    return this.fetchNotionPageAndConvertMarkdownString(pageId);
  }
}
