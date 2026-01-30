import type { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from '../../../../../post/use-cases';
import type { ImageSource } from '../../../../domain';
import { ExternalSourceError } from '../../../shared';
import { notionPageToImageSource } from './mapper';

const DATABASE_ID = process.env.NOTION_AFFILIATE_DATABASE_ID ?? '';

/**
 * Notion implementation of ExternalImageSource for Affiliate.
 * Fetches image sources from Notion Affiliate database (Banner and Product types).
 */
export class NotionAffiliateExternalImageSource implements ExternalImageSource {
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async fetchImageSources(): Promise<ImageSourceRecord[]> {
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
        .filter((item): item is ImageSource => item !== null)
        .map((item) => ({
          id: item.id.getValue(),
          url: item.url.getValue(),
        }));
    } catch (error) {
      throw new ExternalSourceError('Notion', error);
    }
  }
}
