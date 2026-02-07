import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from '../../../../use-cases';
import { ExternalSourceError, postLogger } from '../../../shared';
import { notionPageToImageSource } from './mapper';

const DATABASE_ID = process.env.NOTION_POST_DATABASE_ID ?? '';

/**
 * Notion implementation of ExternalImageSource.
 * Fetches image sources from Notion database.
 */
export class NotionExternalImageSource implements ExternalImageSource {
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async fetchImageSources(): Promise<ImageSourceRecord[]> {
    try {
      const database = await this.notionClient.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'status',
          status: { equals: 'PUBLISHED' },
        },
      });

      const sources = database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((item): item is ImageSourceRecord => item !== null);
      postLogger.info(
        { count: sources.length },
        'Fetched post image sources from Notion'
      );
      return sources;
    } catch (error) {
      postLogger.error(
        { err: error },
        'Failed to fetch post image sources from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }
}
