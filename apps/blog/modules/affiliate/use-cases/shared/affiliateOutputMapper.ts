import {
  type Affiliate,
  AffiliateBanner,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
  AffiliateType,
} from '../../domain';
import type {
  AffiliateBannerOutput,
  AffiliateOutput,
  AffiliateProductOutput,
  AffiliateSubProviderOutput,
  AffiliateTextOutput,
} from './types';

const toBannerOutput = (affiliate: AffiliateBanner): AffiliateBannerOutput => ({
  id: affiliate.id.getValue(),
  name: affiliate.name.getValue(),
  type: AffiliateType.BANNER,
  targetUrl: affiliate.targetUrl.getValue(),
  provider: affiliate.provider.getValue(),
  imageSourceUrl: affiliate.imageSourceUrl.getValue(),
  imageWidth: affiliate.imageWidth.getValue(),
  imageHeight: affiliate.imageHeight.getValue(),
});

const toProductOutput = (
  affiliate: AffiliateProduct
): AffiliateProductOutput => ({
  id: affiliate.id.getValue(),
  name: affiliate.name.getValue(),
  type: AffiliateType.PRODUCT,
  targetUrl: affiliate.targetUrl.getValue(),
  provider: affiliate.provider.getValue(),
  providerColor: affiliate.providerColor.getValue(),
  subProviderIds: affiliate.subProviderIds.getValues(),
  imageProvider: affiliate.imageProvider.getValue(),
  imageSourceUrl: affiliate.imageSourceUrl.getValue(),
  imageWidth: affiliate.imageWidth.getValue(),
  imageHeight: affiliate.imageHeight.getValue(),
});

const toTextOutput = (affiliate: AffiliateText): AffiliateTextOutput => ({
  id: affiliate.id.getValue(),
  name: affiliate.name.getValue(),
  type: AffiliateType.TEXT,
  targetUrl: affiliate.targetUrl.getValue(),
  provider: affiliate.provider.getValue(),
});

const toSubProviderOutput = (
  affiliate: AffiliateSubProvider
): AffiliateSubProviderOutput => ({
  id: affiliate.id.getValue(),
  name: affiliate.name.getValue(),
  type: AffiliateType.SUB_PROVIDER,
  targetUrl: affiliate.targetUrl.getValue(),
  provider: affiliate.provider.getValue(),
  providerColor: affiliate.providerColor.getValue(),
});

/**
 * Maps domain Affiliate entity to AffiliateOutput DTO
 */
export const toAffiliateOutput = (affiliate: Affiliate): AffiliateOutput => {
  if (affiliate instanceof AffiliateBanner) {
    return toBannerOutput(affiliate);
  }
  if (affiliate instanceof AffiliateProduct) {
    return toProductOutput(affiliate);
  }
  if (affiliate instanceof AffiliateText) {
    return toTextOutput(affiliate);
  }
  if (affiliate instanceof AffiliateSubProvider) {
    return toSubProviderOutput(affiliate);
  }

  const exhaustiveCheck: never = affiliate;
  throw new Error(`Unknown affiliate type: ${exhaustiveCheck}`);
};
