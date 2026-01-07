import { TextPromotion } from '../promotion';
import { type AffiliateText } from '../../modules/interfaces/affiliate/validator';

interface AffiliateTextProps {
  affiliateText: AffiliateText;
}

export function AffiliateText(props: AffiliateTextProps) {
  const { affiliateText } = props;

  return (
    <div className="mt-8">
      <TextPromotion id={affiliateText.id} href={affiliateText.targetUrl}>
        {affiliateText.name}
      </TextPromotion>
    </div>
  );
}
