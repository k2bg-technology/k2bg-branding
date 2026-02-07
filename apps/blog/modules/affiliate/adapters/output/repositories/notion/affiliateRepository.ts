import { APIResponseError, type Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type {
  Affiliate,
  AffiliateId,
  AffiliateRepository,
  ImageSource,
} from '../../../../domain';
import { affiliateLogger, ExternalSourceError } from '../../../shared';
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
      affiliateLogger.error(
        { err: error, affiliateId: id.getValue() },
        'Failed to fetch affiliate from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }

  async findByIds(
    ids: readonly AffiliateId[]
  ): Promise<Map<string, Affiliate>> {
    const results = new Map<string, Affiliate>();

    if (ids.length === 0) {
      return results;
    }

    const fetchPromises = ids.map(async (id) => {
      try {
        const page = await this.notionClient.pages.retrieve({
          page_id: id.getValue(),
        });

        if ('properties' in page) {
          const affiliate = notionPageToAffiliate(page as PageObjectResponse);
          if (affiliate) {
            return { id: id.getValue(), affiliate };
          }
        }
        return null;
      } catch (error) {
        if (error instanceof APIResponseError && error.status === 404) {
          return null;
        }
        affiliateLogger.error(
          { err: error, affiliateId: id.getValue() },
          'Failed to fetch affiliate from Notion'
        );
        throw new ExternalSourceError('Notion', error);
      }
    });

    const fetchedResults = await Promise.all(fetchPromises);

    for (const result of fetchedResults) {
      if (result) {
        results.set(result.id, result.affiliate);
      }
    }

    return results;
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

      const sources = database.results
        .map((page) => notionPageToImageSource(page as PageObjectResponse))
        .filter((source): source is ImageSource => source !== null);
      affiliateLogger.info(
        { count: sources.length },
        'Fetched all affiliate image sources from Notion'
      );
      return sources;
    } catch (error) {
      affiliateLogger.error(
        { err: error },
        'Failed to fetch affiliate image sources from Notion'
      );
      throw new ExternalSourceError('Notion', error);
    }
  }
}
