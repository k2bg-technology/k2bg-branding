import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type { ImageSource } from '../../../../domain';
import type { FetchAllImageSourcesQueryService } from '../../../../use-cases/query/fetch-all-image-sources/queryService';
import { affiliateLogger, ExternalSourceError } from '../../../shared';
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

      const sources = database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((source): source is ImageSource => source !== null);
      affiliateLogger.info(
        { count: sources.length },
        'Fetched all affiliate image sources via query service'
      );
      return sources;
    } catch (error) {
      affiliateLogger.error(
        { err: error },
        'Failed to fetch affiliate image sources via query service'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }
}
