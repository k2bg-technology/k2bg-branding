import type {
  AffiliateBanner,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
} from '../entities';
import type { AffiliateId, ImageSourceUrl } from '../value-objects';

export type Affiliate =
  | AffiliateBanner
  | AffiliateProduct
  | AffiliateText
  | AffiliateSubProvider;

export interface ImageSource {
  id: AffiliateId;
  url: ImageSourceUrl;
}

export interface AffiliateRepository {
  findById(id: AffiliateId): Promise<Affiliate | null>;

  /**
   * Missing affiliates are omitted from the result.
   */
  findByIds(ids: readonly AffiliateId[]): Promise<Map<string, Affiliate>>;
}
