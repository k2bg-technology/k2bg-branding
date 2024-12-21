export interface AffiliateCore {
  id: string;
  name?: string;
  type?: string;
  targetUrl?: string;
  provider?: string;
}

export interface AffiliateText extends AffiliateCore {}

export interface AffiliateBanner extends AffiliateCore {
  imageSourceUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface AffiliateProduction extends AffiliateCore {
  subProviders?: string[];
  imageProvider?: string;
  imageSourceUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
}
