import { BannerPromotion } from '../promotion';
import { type AffiliateBanner } from '../../modules/interfaces/affiliate/validator';

interface AffiliateBannerProps {
  affiliateBanner: AffiliateBanner;
}

export function AffiliateBanner(props: AffiliateBannerProps) {
  const { affiliateBanner } = props;

  return (
    <div className="mt-8">
      <BannerPromotion
        id={affiliateBanner.id}
        linkText={affiliateBanner.name}
        linkUrl={affiliateBanner.targetUrl}
        imageUrl={affiliateBanner.imageSourceUrl}
        imageWidth={affiliateBanner.imageWidth}
        imageHeight={affiliateBanner.imageHeight}
      />
    </div>
  );
}
