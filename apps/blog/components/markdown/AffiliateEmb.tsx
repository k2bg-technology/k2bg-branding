import { cache } from 'react';
import {
  createFetchAffiliatesByIdsUseCase,
  createFetchAffiliateUseCase,
} from '../../infrastructure';
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

  const { affiliate } = await fetchAffiliateById(id);

  const affiliateSubProviders =
    affiliate.type === AffiliateType.PRODUCT
      ? await fetchSubProviders(affiliate.subProviderIds)
      : [];

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
