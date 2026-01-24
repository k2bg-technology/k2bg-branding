import type { AffiliateType } from '../../domain';

/**
 * Output type for affiliate image source data
 */
export interface ImageSourceOutput {
  id: string;
  url: string;
}

/**
 * Base output type for all affiliates
 */
interface AffiliateBaseOutput {
  id: string;
  name: string;
  type: AffiliateType;
  targetUrl: string;
  provider: string;
}

/**
 * Output type for Banner affiliate
 */
export interface AffiliateBannerOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.BANNER;
  imageSourceUrl: string;
  imageWidth: number;
  imageHeight: number;
}

/**
 * Output type for Product affiliate
 */
export interface AffiliateProductOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.PRODUCT;
  providerColor: string;
  subProviderIds: readonly string[];
  imageProvider: string;
  imageSourceUrl: string;
  imageWidth: number;
  imageHeight: number;
}

/**
 * Output type for Text affiliate
 */
export interface AffiliateTextOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.TEXT;
}

/**
 * Output type for SubProvider affiliate
 */
export interface AffiliateSubProviderOutput extends AffiliateBaseOutput {
  type: typeof AffiliateType.SUB_PROVIDER;
  providerColor: string;
}

/**
 * Union type for all affiliate outputs
 */
export type AffiliateOutput =
  | AffiliateBannerOutput
  | AffiliateProductOutput
  | AffiliateTextOutput
  | AffiliateSubProviderOutput;
