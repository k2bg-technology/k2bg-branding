import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { NotionToMarkdown } from 'notion-to-md';
import type { Post } from '../../../../domain';
import type { ExternalPostSource } from '../../../../use-cases';
import { ExternalSourceError } from '../../../shared';
import { getEmbedTypeFromPage, mapEmbedType, notionPageToPost } from './mapper';

const DATABASE_ID = process.env.NOTION_POST_DATABASE_ID ?? '';

/**
 * Notion implementation of ExternalPostSource.
 * Fetches posts from Notion database.
 */
export class NotionExternalPostSource implements ExternalPostSource {
  constructor(
    private readonly notionClient: Client,
    private readonly n2m: NotionToMarkdown,
    private readonly databaseId: string = DATABASE_ID
  ) {
    this.n2m.setCustomTransformer('callout', () => false);

    this.n2m.setCustomTransformer('link_to_page', async (block) => {
      if (!('link_to_page' in block && 'page_id' in block.link_to_page)) {
        return false;
      }

      const page = await this.notionClient.pages.retrieve({
        page_id: block.link_to_page.page_id,
        filter_properties: ['type'],
      });

      if (!('properties' in page)) {
        return false;
      }

      const typeString = getEmbedTypeFromPage(page as PageObjectResponse);
      const embedType = typeString ? mapEmbedType(typeString) : null;

      if (!embedType) {
        return false;
      }

      return `::embed{id=${block.link_to_page.page_id} type=${embedType}}`;
    });
  }

  async fetchAllPosts(): Promise<Post[]> {
    try {
      const database = await this.notionClient.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'status',
          status: { equals: 'PUBLISHED' },
        },
        sorts: [{ property: 'releaseDate', direction: 'descending' }],
      });

      const posts = await Promise.all(
        database.results.map(async (page) => {
          const pageResponse = page as PageObjectResponse;
          const mdBlocks = await this.n2m.pageToMarkdown(page.id);
          const content = this.n2m.toMarkdownString(mdBlocks).parent;
          return notionPageToPost(pageResponse, content);
        })
      );

      return posts;
    } catch (error) {
      throw new ExternalSourceError('Notion', error);
    }
  }
}
