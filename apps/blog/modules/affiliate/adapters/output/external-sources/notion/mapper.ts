import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import {
  getAllFileUrls,
  getNumber,
  getRelations,
  getSelect,
  getTitle,
  getUrl,
  type NotionProperties,
} from '../../../../../../infrastructure/notion';
import {
  type Affiliate,
  AffiliateBanner,
  AffiliateId,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
  AffiliateType,
  ImageHeight,
  ImageProvider,
  type ImageSource,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  ProviderColor,
  SubProviderIds,
  TargetUrl,
} from '../../../../domain';
import { DEFAULT_VALUES, MappingError } from '../../../shared';

// Image source URL extraction with file priority
function getImageSourceUrl(props: NotionProperties): string | null {
  const fileUrl = getAllFileUrls(props, 'imageSourceFile')?.[0];
  if (fileUrl) return fileUrl;
  return getUrl(props, 'imageSourceUrl');
}

// Type determination

export function determineAffiliateType(
  page: PageObjectResponse
): AffiliateType | null {
  const typeString = getSelect(page.properties, 'type');

  switch (typeString?.toUpperCase()) {
    case 'AFFILIATE_BANNER':
      return AffiliateType.BANNER;
    case 'AFFILIATE_PRODUCT':
      return AffiliateType.PRODUCT;
    case 'AFFILIATE_TEXT':
      return AffiliateType.TEXT;
    case 'AFFILIATE_SUB_PROVIDER':
      return AffiliateType.SUB_PROVIDER;
    default:
      return null;
  }
}

// Core props extraction

interface CorePropsRaw {
  id: AffiliateId;
  name: Name;
  targetUrl: TargetUrl;
  provider: Provider;
}

function extractCoreProps(page: PageObjectResponse): CorePropsRaw {
  const props = page.properties;
  return {
    id: AffiliateId.reconstitute(page.id),
    name: Name.reconstitute(getTitle(props, 'name') ?? 'Untitled'),
    targetUrl: TargetUrl.reconstitute(getUrl(props, 'targetUrl') ?? ''),
    provider: Provider.reconstitute(getSelect(props, 'provider') ?? 'Unknown'),
  };
}

// Individual entity mappers

function mapToBanner(page: PageObjectResponse): AffiliateBanner {
  const props = page.properties;
  const coreProps = extractCoreProps(page);

  return AffiliateBanner.reconstitute({
    ...coreProps,
    imageSourceUrl: ImageSourceUrl.reconstitute(
      getImageSourceUrl(props) ?? DEFAULT_VALUES.PLACEHOLDER_IMAGE_URL
    ),
    imageWidth: ImageWidth.reconstitute(
      getNumber(props, 'imageWidth') ?? DEFAULT_VALUES.DEFAULT_IMAGE_WIDTH
    ),
    imageHeight: ImageHeight.reconstitute(
      getNumber(props, 'imageHeight') ?? DEFAULT_VALUES.DEFAULT_IMAGE_HEIGHT
    ),
  });
}

function mapToProduct(page: PageObjectResponse): AffiliateProduct {
  const props = page.properties;
  const coreProps = extractCoreProps(page);

  const subProviderRelations = getRelations(props, 'subProviders');

  return AffiliateProduct.reconstitute({
    ...coreProps,
    providerColor: ProviderColor.reconstitute(
      getSelect(props, 'providerColor') ?? DEFAULT_VALUES.DEFAULT_PROVIDER_COLOR
    ),
    subProviderIds: SubProviderIds.reconstitute(subProviderRelations),
    imageProvider: ImageProvider.reconstitute(
      getSelect(props, 'imageProvider') ?? coreProps.provider.getValue()
    ),
    imageSourceUrl: ImageSourceUrl.reconstitute(
      getImageSourceUrl(props) ?? DEFAULT_VALUES.PLACEHOLDER_IMAGE_URL
    ),
    imageWidth: ImageWidth.reconstitute(
      getNumber(props, 'imageWidth') ?? DEFAULT_VALUES.DEFAULT_IMAGE_WIDTH
    ),
    imageHeight: ImageHeight.reconstitute(
      getNumber(props, 'imageHeight') ?? DEFAULT_VALUES.DEFAULT_IMAGE_HEIGHT
    ),
  });
}

function mapToText(page: PageObjectResponse): AffiliateText {
  return AffiliateText.reconstitute(extractCoreProps(page));
}

function mapToSubProvider(page: PageObjectResponse): AffiliateSubProvider {
  const props = page.properties;
  const coreProps = extractCoreProps(page);

  return AffiliateSubProvider.reconstitute({
    ...coreProps,
    providerColor: ProviderColor.reconstitute(
      getSelect(props, 'providerColor') ?? DEFAULT_VALUES.DEFAULT_PROVIDER_COLOR
    ),
  });
}

// Main mapping functions

export function notionPageToAffiliate(page: PageObjectResponse): Affiliate {
  const affiliateType = determineAffiliateType(page);
  if (!affiliateType) {
    throw new MappingError(`Unknown affiliate type for page: ${page.id}`);
  }

  switch (affiliateType) {
    case AffiliateType.BANNER:
      return mapToBanner(page);
    case AffiliateType.PRODUCT:
      return mapToProduct(page);
    case AffiliateType.TEXT:
      return mapToText(page);
    case AffiliateType.SUB_PROVIDER:
      return mapToSubProvider(page);
  }
}

export function notionPageToImageSource(
  page: PageObjectResponse
): ImageSource | null {
  const affiliateType = determineAffiliateType(page);

  if (
    affiliateType !== AffiliateType.BANNER &&
    affiliateType !== AffiliateType.PRODUCT
  ) {
    return null;
  }

  const imageUrl = getImageSourceUrl(page.properties);
  if (!imageUrl) return null;

  return {
    id: AffiliateId.reconstitute(page.id),
    url: ImageSourceUrl.reconstitute(imageUrl),
  };
}
