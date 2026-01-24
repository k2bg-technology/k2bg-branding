import type { AffiliateId, ImageSourceUrl } from '../value-objects';

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
   * Retrieves all image sources from Banner and Product affiliates.
   * Used for batch image processing and CDN uploads.
   */
  findAllImageSources(): Promise<ImageSource[]>;
}
