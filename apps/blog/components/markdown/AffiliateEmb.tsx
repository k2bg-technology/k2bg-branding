import { cache } from 'react';
import {
  createFetchAffiliatesByIdsUseCase,
  createFetchAffiliateUseCase,
} from '../../infrastructure/di/affiliate';
import { affiliateLogger } from '../../modules/affiliate/adapters/shared/logger';
import { AffiliateType } from '../../modules/affiliate/domain';
import { AffiliateBanner } from './AffiliateBanner';
import { AffiliateProduct } from './AffiliateProduct';
import { AffiliateText } from './AffiliateText';

/**
 * Request-level memoized affiliate fetcher.
 * Caches results per request to avoid duplicate API calls for the same ID.
 */
const fetchAffiliateById = cache(async (id: string) => {
  const useCase = createFetchAffiliateUseCase();
  return useCase.execute({ id });
});

/**
 * Request-level memoized batch affiliate fetcher.
 */
const fetchAffiliatesByIds = cache(async (ids: readonly string[]) => {
  const useCase = createFetchAffiliatesByIdsUseCase();
  return useCase.execute({ ids });
});

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
    affiliateLogger.error(
      { err: error, id },
      'Failed to fetch affiliate embed'
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
  const { affiliate } = await fetchAffiliateById(id);

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
async function fetchSubProviders(
  subProviderIds: readonly string[]
): Promise<SubProvider[]> {
  if (subProviderIds.length === 0) {
    return [];
  }

  // Use request-level cached batch fetch
  const { affiliates } = await fetchAffiliatesByIds(subProviderIds);

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
          subProvider.type === AffiliateType.PRODUCT
            ? subProvider.providerColor
            : '',
      };
    })
    .filter((item): item is SubProvider => item !== null);
}
