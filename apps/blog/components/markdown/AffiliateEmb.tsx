import { cacheLife, cacheTag } from 'next/cache';
import { after } from 'next/server';
import { cache } from 'react';
import {
  type CachedReadResult,
  RECOVERABLE_FAILURE_CACHE_LIFE,
  restoreCacheError,
  serializeCacheError,
} from '../../infrastructure/cache/readResult';
import { BLOG_CACHE_TAG } from '../../infrastructure/cache/tags';
import {
  createFetchAffiliatesByIdsUseCase,
  createFetchAffiliateUseCase,
} from '../../infrastructure/di/affiliate';
import { affiliateLogger } from '../../modules/affiliate/adapters/shared/logger';
import { AffiliateType } from '../../modules/affiliate/domain';
import type {
  FetchAffiliateOutput,
  FetchAffiliatesByIdsOutput,
} from '../../modules/affiliate/use-cases/query';
import { AffiliateBanner } from './AffiliateBanner';
import { AffiliateProduct } from './AffiliateProduct';
import { AffiliateText } from './AffiliateText';

/**
 * Affiliate reads are memoized within each request and revalidated hourly.
 */
const fetchAffiliateById = cache(
  async (id: string): Promise<CachedReadResult<FetchAffiliateOutput>> => {
    'use cache';
    cacheTag(BLOG_CACHE_TAG);
    try {
      const data = await createFetchAffiliateUseCase().execute({ id });
      cacheLife('hours');
      return { data };
    } catch (error) {
      cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
      return { error: serializeCacheError(error) };
    }
  }
);

/**
 * Batch affiliate reads are memoized within each request and revalidated hourly.
 */
const fetchAffiliatesByIds = cache(
  async (
    ids: readonly string[]
  ): Promise<CachedReadResult<FetchAffiliatesByIdsOutput>> => {
    'use cache';
    cacheTag(BLOG_CACHE_TAG);
    try {
      const data = await createFetchAffiliatesByIdsUseCase().execute({ ids });
      cacheLife('hours');
      return { data };
    } catch (error) {
      cacheLife(RECOVERABLE_FAILURE_CACHE_LIFE);
      return { error: serializeCacheError(error) };
    }
  }
);

interface AffiliateEmbProps {
  id: string;
}

interface SubProvider {
  linkText: string;
  linkUrl: string;
  color: string;
}

export async function AffiliateEmb(props: AffiliateEmbProps) {
  const { id } = props;

  const data = await loadAffiliateEmbData(id).catch((error) => {
    // Pino's timestamp reads the clock, so logging runs after prerendering.
    after(() =>
      affiliateLogger.error(
        { err: error, id },
        'Failed to fetch affiliate embed'
      )
    );
    return null;
  });

  if (data === null) {
    return null;
  }

  const { affiliate, affiliateSubProviders } = data;

  return (
    <div className="mt-8">
      {(() => {
        switch (affiliate.type) {
          case AffiliateType.TEXT:
            return <AffiliateText affiliateText={affiliate} />;
          case AffiliateType.BANNER:
            return <AffiliateBanner affiliateBanner={affiliate} />;
          case AffiliateType.PRODUCT:
            return (
              <AffiliateProduct
                affiliateProduct={affiliate}
                affiliateSubProviders={affiliateSubProviders}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
}

/**
 * Loads the affiliate and, for product affiliates, its sub-providers.
 * Isolated from rendering so the caller can fail soft on any fetch error.
 */
async function loadAffiliateEmbData(id: string) {
  const result = await fetchAffiliateById(id);
  if ('error' in result) {
    throw restoreCacheError(result.error);
  }
  const { affiliate } = result.data;

  const affiliateSubProviders =
    affiliate.type === AffiliateType.PRODUCT
      ? await fetchSubProviders(affiliate.subProviderIds)
      : [];

  return { affiliate, affiliateSubProviders };
}

/**
 * Fetches sub-providers in a single batch operation.
 * Uses request-level caching to avoid duplicate API calls.
 */
async function fetchSubProviders(subProviderIds: readonly string[]) {
  if (subProviderIds.length === 0) {
    return [];
  }

  // Use request-level cached batch fetch
  const result = await fetchAffiliatesByIds(subProviderIds);
  if ('error' in result) {
    throw restoreCacheError(result.error);
  }
  const { affiliates } = result.data;

  return subProviderIds
    .map((id) => {
      const subProvider = affiliates.get(id);
      if (!subProvider) {
        return null;
      }

      return {
        linkText: subProvider.provider,
        linkUrl: subProvider.targetUrl,
        color:
          subProvider.type === AffiliateType.SUB_PROVIDER
            ? subProvider.providerColor
            : '',
      };
    })
    .filter((item): item is SubProvider => item !== null);
}
