import type { AffiliateBannerOutput } from '../../modules/affiliate/use-cases';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { BannerPromotion } from '../promotion';

interface AffiliateBannerProps {
  affiliateBanner: AffiliateBannerOutput;
}

export function AffiliateBanner(props: AffiliateBannerProps) {
  const { affiliateBanner } = props;

  return (
    <BannerPromotion
      linkUrl={affiliateBanner.targetUrl}
      image={
        <CloudinaryImage
          publicId={affiliateBanner.id}
          className="object-contain cursor-pointer"
          src={affiliateBanner.imageSourceUrl}
          alt={affiliateBanner.name}
          width={affiliateBanner.imageWidth}
          height={affiliateBanner.imageHeight}
        />
      }
    />
  );
}
