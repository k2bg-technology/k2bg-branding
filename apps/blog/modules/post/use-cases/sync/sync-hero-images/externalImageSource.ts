/**
 * Image source record from external sources
 */
export interface ImageSourceRecord {
  id: string;
  url: string;
}

/**
 * External image source interface
 *
 * Abstracts the source of images (e.g., Post hero images, Media, Affiliates)
 */
export interface ExternalImageSource {
  /**
   * Fetches all image sources
   */
  fetchImageSources(): Promise<ImageSourceRecord[]>;
}
