import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from '../../../../../post/use-cases';
import type { ImageSource } from '../../../../domain';
import {
  ExternalSourceError,
  mediaLogger,
  NOTION_MEDIA_TYPES,
} from '../../../shared';
import { notionPageToImageSource } from './mapper';

const DATABASE_ID = process.env.NOTION_MEDIA_DATABASE_ID ?? '';

/**
 * Notion implementation of ExternalImageSource for Media.
 * Fetches image sources from Notion Media database.
 */
export class NotionMediaExternalImageSource implements ExternalImageSource {
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async fetchImageSources(): Promise<ImageSourceRecord[]> {
    try {
      const database = await this.notionClient.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'type',
          select: {
            equals: NOTION_MEDIA_TYPES.IMAGE,
          },
        },
      });

      const sources = database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((item): item is ImageSource => item !== null)
        .map((item) => ({
          id: item.id.getValue(),
          url: item.url.getValue(),
        }));
      mediaLogger.info(
        { count: sources.length },
        'Fetched media image sources from Notion'
      );
      return sources;
    } catch (error) {
      mediaLogger.error(
        { err: error },
        'Failed to fetch media image sources from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }
}
