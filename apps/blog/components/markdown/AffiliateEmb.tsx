import { createFetchAffiliateUseCase } from '../../infrastructure';
import { AffiliateType } from '../../modules/affiliate/domain';
import type {
  AffiliateBannerOutput,
  AffiliateProductOutput,
  AffiliateTextOutput,
} from '../../modules/affiliate/use-cases/shared';
import { BannerPromotion, ProductPromotion, TextPromotion } from '../promotion';

interface AffiliateEmbProps {
  id: string;
}

export async function AffiliateEmb(props: AffiliateEmbProps) {
  const { id } = props;

  const fetchAffiliate = createFetchAffiliateUseCase();
  const { affiliate } = await fetchAffiliate.execute({ id });

  return (
    <div className="mt-8">
      {(() => {
        switch (affiliate.type) {
          case AffiliateType.TEXT:
            return <TextContent affiliate={affiliate} />;
          case AffiliateType.BANNER:
            return <BannerContent affiliate={affiliate} />;
          case AffiliateType.PRODUCT:
            return <ProductContent affiliate={affiliate} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

function TextContent({ affiliate }: { affiliate: AffiliateTextOutput }) {
  return (
    <TextPromotion id={affiliate.id} href={affiliate.targetUrl}>
      {affiliate.name}
    </TextPromotion>
  );
}

function BannerContent({ affiliate }: { affiliate: AffiliateBannerOutput }) {
  return (
    <BannerPromotion
      id={affiliate.id}
      linkText={affiliate.name}
      linkUrl={affiliate.targetUrl}
      imageUrl={affiliate.imageSourceUrl}
      imageWidth={affiliate.imageWidth}
      imageHeight={affiliate.imageHeight}
    />
  );
}

async function ProductContent({
  affiliate,
}: {
  affiliate: AffiliateProductOutput;
}) {
  const fetchAffiliate = createFetchAffiliateUseCase();

  const subProviders = await Promise.all(
    affiliate.subProviderIds.map(async (subProviderId) => {
      const { affiliate: subProvider } = await fetchAffiliate.execute({
        id: subProviderId,
      });
      return {
        linkText: subProvider.provider,
        linkUrl: subProvider.targetUrl,
        color: 'providerColor' in subProvider ? subProvider.providerColor : '',
      };
    })
  );

  return (
    <ProductPromotion
      id={affiliate.id}
      linkText={affiliate.name}
      linkUrl={affiliate.targetUrl}
      imageUrl={affiliate.imageSourceUrl}
      imageWidth={affiliate.imageWidth}
      imageHeight={affiliate.imageHeight}
      providers={[
        {
          linkText: affiliate.provider,
          linkUrl: affiliate.targetUrl,
          color: affiliate.providerColor,
        },
        ...subProviders,
      ]}
    />
  );
}
