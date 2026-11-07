import type { AffiliateTextOutput } from '../../modules/affiliate/use-cases';
import { TextPromotion } from '../promotion';

interface Props {
  affiliateText: AffiliateTextOutput;
}

export function AffiliateText(props: Props) {
  const { affiliateText } = props;

  return (
    <TextPromotion id={affiliateText.id} href={affiliateText.targetUrl}>
      {affiliateText.name}
    </TextPromotion>
  );
}
