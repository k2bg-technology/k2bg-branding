import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from '../../../../use-cases';
import { ExternalSourceError } from '../../../shared';
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

      return database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((item): item is ImageSourceRecord => item !== null);
    } catch (error) {
      throw new ExternalSourceError('Notion', error);
    }
  }
}
