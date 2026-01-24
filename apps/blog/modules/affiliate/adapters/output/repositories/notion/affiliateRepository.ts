import { APIResponseError, type Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type {
  Affiliate,
  AffiliateId,
  AffiliateRepository,
  ImageSource,
} from '../../../../domain';
import { ExternalSourceError } from '../../../shared';
import {
  notionPageToAffiliate,
  notionPageToImageSource,
} from '../../external-sources/notion/mapper';

const DATABASE_ID = process.env.NOTION_AFFILIATE_DATABASE_ID ?? '';

export class NotionAffiliateRepository implements AffiliateRepository {
  constructor(
    private readonly notionClient: Client,
    private readonly databaseId: string = DATABASE_ID
  ) {}

  async findById(id: AffiliateId): Promise<Affiliate | null> {
    try {
      const page = await this.notionClient.pages.retrieve({
        page_id: id.getValue(),
      });

      if (!('properties' in page)) {
        return null;
      }

      return notionPageToAffiliate(page as PageObjectResponse);
    } catch (error) {
      if (error instanceof APIResponseError && error.status === 404) {
        return null;
      }
      throw new ExternalSourceError('Notion', error);
    }
  }

  async findAllImageSources(): Promise<ImageSource[]> {
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
