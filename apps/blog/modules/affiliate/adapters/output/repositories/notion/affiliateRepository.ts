import { APIResponseError, type Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type {
  Affiliate,
  AffiliateId,
  AffiliateRepository,
} from '../../../../domain';
import { affiliateLogger, ExternalSourceError } from '../../../shared';
import { notionPageToAffiliate } from '../../external-sources/notion/mapper';

export class NotionAffiliateRepository implements AffiliateRepository {
  constructor(private readonly notionClient: Client) {}

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
}
