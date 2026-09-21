import type { AffiliateType } from '../../domain';

interface AffiliateBaseOutput {
  id: string;
  name: string;
  type: AffiliateType;
  targetUrl: string;
  provider: string;
}

export interface AffiliateBannerOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.BANNER;
  imageSourceUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface AffiliateProductOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.PRODUCT;
  providerColor: string;
  subProviderIds: readonly string[];
  imageProvider: string;
  imageSourceUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface AffiliateTextOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.TEXT;
}

export interface AffiliateSubProviderOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.SUB_PROVIDER;
  providerColor: string;
}

export type AffiliateOutput =
  | AffiliateBannerOutput
  | AffiliateProductOutput
  | AffiliateTextOutput
  | AffiliateSubProviderOutput;
