import { ProductPromotion } from '../promotion';
import {
  AffiliateSubProvider,
  type AffiliateProduct,
} from '../../modules/interfaces/affiliate/validator';

interface AffiliateProductProps {
  affiliateProduct: AffiliateProduct;
  subProviders: AffiliateSubProvider[];
}

export function AffiliateProduct(props: AffiliateProductProps) {
  const { affiliateProduct, subProviders } = props;

  return (
    <div className="mt-8">
      <ProductPromotion
        id={affiliateProduct.id}
        linkText={affiliateProduct.name}
        linkUrl={affiliateProduct.targetUrl}
        imageUrl={affiliateProduct.imageSourceUrl}
        imageWidth={affiliateProduct.imageWidth}
        imageHeight={affiliateProduct.imageHeight}
        providers={[
          {
            linkText: affiliateProduct.provider,
            linkUrl: affiliateProduct.targetUrl,
            color: affiliateProduct.providerColor,
          },
          ...subProviders.map((subProvider) => ({
            linkText: subProvider.provider,
            linkUrl: subProvider.targetUrl,
            color: subProvider.providerColor,
          })),
        ]}
      />
    </div>
  );
}
