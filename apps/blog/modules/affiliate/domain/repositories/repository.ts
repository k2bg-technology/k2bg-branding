import type {
  AffiliateBanner,
  AffiliateProduct,
  AffiliateSubProvider,
  AffiliateText,
} from '../entities';
import type { AffiliateId, ImageSourceUrl } from '../value-objects';

/**
 * Union type for all Affiliate entities
 */
export type Affiliate =
  | AffiliateBanner
  | AffiliateProduct
  | AffiliateText
  | AffiliateSubProvider;

/**
 * Image source data returned from the repository
 */
export interface ImageSource {
  id: AffiliateId;
  url: ImageSourceUrl;
}

/**
 * AffiliateRepository Interface
 *
 * Defines the contract for affiliate data persistence operations.
 * Implementations should be provided by the infrastructure layer.
 */
export interface AffiliateRepository {
  /**
   * Finds an affiliate by its ID.
   * Returns null if not found.
   */
  findById(id: AffiliateId): Promise<Affiliate | null>;

  /**
   * Finds multiple affiliates by their IDs.
   * Returns a map of ID to Affiliate. Missing affiliates are not included in the result.
   */
  findByIds(ids: readonly AffiliateId[]): Promise<Map<string, Affiliate>>;

  /**
   * Retrieves all image sources from Banner and Product affiliates.
   * Used for batch image processing and CDN uploads.
   */
  findAllImageSources(): Promise<ImageSource[]>;
}
