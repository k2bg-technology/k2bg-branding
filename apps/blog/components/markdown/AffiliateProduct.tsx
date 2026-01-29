import type { AffiliateProductOutput } from '../../modules/affiliate/use-cases';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

import { ProductPromotion } from '../promotion';

interface SubProvider {
  linkText: string;
  linkUrl: string;
  color: string;
}

interface AffiliateProductProps {
  affiliateProduct: AffiliateProductOutput;
  affiliateSubProviders: SubProvider[];
}

export function AffiliateProduct(props: AffiliateProductProps) {
  const { affiliateProduct, affiliateSubProviders } = props;

  return (
    <ProductPromotion
      linkText={affiliateProduct.name}
      linkUrl={affiliateProduct.targetUrl}
      image={
        <CloudinaryImage
          publicId={affiliateProduct.id}
          className="object-contain object-top cursor-pointer w-[120px] max-h-[160px]"
          src={affiliateProduct.imageSourceUrl}
          alt={affiliateProduct.name}
          width={affiliateProduct.imageWidth}
          height={affiliateProduct.imageHeight}
        />
      }
      providers={[
        {
          linkText: affiliateProduct.provider,
          linkUrl: affiliateProduct.targetUrl,
          color: affiliateProduct.providerColor,
        },
        ...affiliateSubProviders,
      ]}
    />
  );
}
