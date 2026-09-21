import {
  AffiliateBanner,
  AffiliateId,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
  ImageHeight,
  ImageProvider,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  ProviderColor,
  SubProviderIds,
  TargetUrl,
} from '../../../domain';

// biome-ignore lint/plugin/noLet: The factory sequence counter persists across factory calls.
let counter = 0;

export const createAffiliateBanner = (
  overrides: Partial<{
    id: AffiliateId;
    name: Name;
    targetUrl: TargetUrl;
    provider: Provider;
    imageSourceUrl: ImageSourceUrl;
    imageWidth: ImageWidth;
    imageHeight: ImageHeight;
  }> = {}
): AffiliateBanner => {
  counter++;
  return AffiliateBanner.reconstitute({
    id:
      overrides.id ??
      AffiliateId.reconstitute(
        `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
      ),
    name: overrides.name ?? Name.reconstitute(`Test Banner ${counter}`),
    targetUrl:
      overrides.targetUrl ??
      TargetUrl.reconstitute(`https://example.com/banner/${counter}`),
    provider: overrides.provider ?? Provider.reconstitute('Amazon'),
    imageSourceUrl:
      overrides.imageSourceUrl ??
      ImageSourceUrl.reconstitute(
        `https://example.com/images/banner-${counter}.jpg`
      ),
    imageWidth: overrides.imageWidth ?? ImageWidth.reconstitute(300),
    imageHeight: overrides.imageHeight ?? ImageHeight.reconstitute(250),
  });
};

export const createAffiliateProduct = (
  overrides: Partial<{
    id: AffiliateId;
    name: Name;
    targetUrl: TargetUrl;
    provider: Provider;
    providerColor: ProviderColor;
    subProviderIds: SubProviderIds;
    imageProvider: ImageProvider;
    imageSourceUrl: ImageSourceUrl;
    imageWidth: ImageWidth;
    imageHeight: ImageHeight;
  }> = {}
): AffiliateProduct => {
  counter++;
  return AffiliateProduct.reconstitute({
    id:
      overrides.id ??
      AffiliateId.reconstitute(
        `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
      ),
    name: overrides.name ?? Name.reconstitute(`Test Product ${counter}`),
    targetUrl:
      overrides.targetUrl ??
      TargetUrl.reconstitute(`https://example.com/product/${counter}`),
    provider: overrides.provider ?? Provider.reconstitute('Amazon'),
    providerColor:
      overrides.providerColor ?? ProviderColor.reconstitute('#FF9900'),
    subProviderIds: overrides.subProviderIds ?? SubProviderIds.reconstitute([]),
    imageProvider:
      overrides.imageProvider ?? ImageProvider.reconstitute('Amazon'),
    imageSourceUrl:
      overrides.imageSourceUrl ??
      ImageSourceUrl.reconstitute(
        `https://example.com/images/product-${counter}.jpg`
      ),
    imageWidth: overrides.imageWidth ?? ImageWidth.reconstitute(200),
    imageHeight: overrides.imageHeight ?? ImageHeight.reconstitute(200),
  });
};

export const createAffiliateText = (
  overrides: Partial<{
    id: AffiliateId;
    name: Name;
    targetUrl: TargetUrl;
    provider: Provider;
  }> = {}
): AffiliateText => {
  counter++;
  return AffiliateText.reconstitute({
    id:
      overrides.id ??
      AffiliateId.reconstitute(
        `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
      ),
    name: overrides.name ?? Name.reconstitute(`Test Text ${counter}`),
    targetUrl:
      overrides.targetUrl ??
      TargetUrl.reconstitute(`https://example.com/text/${counter}`),
    provider: overrides.provider ?? Provider.reconstitute('Amazon'),
  });
};

export const createAffiliateSubProvider = (
  overrides: Partial<{
    id: AffiliateId;
    name: Name;
    targetUrl: TargetUrl;
    provider: Provider;
    providerColor: ProviderColor;
  }> = {}
): AffiliateSubProvider => {
  counter++;
  return AffiliateSubProvider.reconstitute({
    id:
      overrides.id ??
      AffiliateId.reconstitute(
        `550e8400-e29b-41d4-a716-${String(counter).padStart(12, '0')}`
      ),
    name: overrides.name ?? Name.reconstitute(`Test SubProvider ${counter}`),
    targetUrl:
      overrides.targetUrl ??
      TargetUrl.reconstitute(`https://example.com/subprovider/${counter}`),
    provider: overrides.provider ?? Provider.reconstitute('Rakuten'),
    providerColor:
      overrides.providerColor ?? ProviderColor.reconstitute('#BF0000'),
  });
};

export const resetFactoryCounter = (): void => {
  counter = 0;
};
