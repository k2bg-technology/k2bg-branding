import { APIResponseError, type Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type {
  ImageSource,
  Media,
  MediaId,
  MediaRepository,
} from '../../../../domain';
import {
  ExternalSourceError,
  mediaLogger,
  NOTION_MEDIA_TYPES,
} from '../../../shared';
import {
  notionPageToImageSource,
  notionPageToMedia,
} from '../../external-sources/notion/mapper';

const DATABASE_ID = process.env.NOTION_MEDIA_DATABASE_ID ?? '';

export class NotionMediaRepository implements MediaRepository {
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async findById(id: MediaId): Promise<Media | null> {
    try {
      const page = await this.notionClient.pages.retrieve({
        page_id: id.getValue(),
      });

      if (!('properties' in page)) {
        return null;
      }

      return notionPageToMedia(page as PageObjectResponse);
    } catch (error) {
      if (error instanceof APIResponseError && error.status === 404) {
        return null;
      }
      mediaLogger.error(
        { err: error, mediaId: id.getValue() },
        'Failed to fetch media from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }

  async findAllImageSources(): Promise<ImageSource[]> {
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
        .filter((source): source is ImageSource => source !== null);
      mediaLogger.info(
        { count: sources.length },
        'Fetched all media image sources from Notion'
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
