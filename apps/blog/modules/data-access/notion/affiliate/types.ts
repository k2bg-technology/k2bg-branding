export interface Affiliate {
  id: string;
  name?: string;
  type?: string;
  targetUrl?: string;
  provider?: string;
}

export interface AffiliateText extends Affiliate {}

export interface AffiliateBanner extends Affiliate {
  imageSourceUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface AffiliateProduction extends Affiliate {
  subProviders?: string[];
  imageProvider?: string;
  imageSourceUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
}
