import type { Media } from '../entities';
import type { MediaId, SourceUrl } from '../value-objects';

/**
 * Image source data returned from the repository
 */
export interface ImageSource {
  id: MediaId;
  url: SourceUrl;
}

/**
 * MediaRepository Interface
 *
 * Defines the contract for media data persistence operations.
 * Implementations should be provided by the infrastructure layer.
 */
export interface MediaRepository {
  /**
   * Finds a media by its ID.
   * Returns null if not found.
   */
  findById(id: MediaId): Promise<Media | null>;

  /**
   * Retrieves all image sources from image media.
   * Used for batch image processing and CDN uploads.
   */
  findAllImageSources(): Promise<ImageSource[]>;
}
