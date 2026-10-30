import type { AffiliateBannerOutput } from '../../modules/affiliate/use-cases';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { BannerPromotion } from '../promotion';

interface Props {
  affiliateBanner: AffiliateBannerOutput;
}

export function AffiliateBanner(props: Props) {
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
