import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type { ImageSource } from '../../../../domain';
import type { FetchAllImageSourcesQueryService } from '../../../../use-cases/query/fetch-all-image-sources/queryService';
import { ExternalSourceError } from '../../../shared';
import { notionPageToImageSource } from '../../external-sources/notion/mapper';

const DATABASE_ID = process.env.NOTION_AFFILIATE_DATABASE_ID ?? '';

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
          or: [
            { property: 'type', select: { equals: 'AFFILIATE_BANNER' } },
            { property: 'type', select: { equals: 'AFFILIATE_PRODUCT' } },
          ],
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
