import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { ImageSource } from '../../../../domain';
import type { FetchAllImageSourcesQueryService } from '../../../../use-cases/query/fetch-all-image-sources/queryService';
import { ExternalSourceError, NOTION_MEDIA_TYPES } from '../../../shared';
import { notionPageToImageSource } from '../../external-sources/notion/mapper';

const DATABASE_ID = process.env.NOTION_MEDIA_DATABASE_ID ?? '';

export class NotionFetchAllImageSourcesQueryService
  implements FetchAllImageSourcesQueryService
{
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async fetchAllImageSources(): Promise<ImageSource[]> {
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

      return database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((source): source is ImageSource => source !== null);
    } catch (error) {
      throw new ExternalSourceError('Notion', error);
    }
  }
}
