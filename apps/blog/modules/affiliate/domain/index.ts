export type {
  AffiliateBannerProps,
  AffiliateProductProps,
  AffiliateSubProviderProps,
  AffiliateTextProps,
  CoreProps,
} from './entities';
export {
  AffiliateBanner,
  AffiliateCore,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
} from './entities';

export {
  DomainError,
  InvalidAffiliateIdError,
  InvalidImageHeightError,
  InvalidImageProviderError,
  InvalidImageSourceUrlError,
  InvalidImageWidthError,
  InvalidNameError,
  InvalidProviderColorError,
  InvalidProviderError,
  InvalidSubProviderIdsError,
  InvalidTargetUrlError,
} from './errors/errors';

export type {
  Affiliate,
  AffiliateRepository,
  ImageSource,
} from './repositories/repository';

export { AffiliateType } from './types/enums';

export {
  AffiliateId,
  ImageHeight,
  ImageProvider,
  ImageSourceUrl,
  ImageWidth,
  Name,
  Provider,
  ProviderColor,
  SubProviderIds,
  TargetUrl,
} from './value-objects';
