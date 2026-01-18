/**
 * Repository interface for image upload operations
 */
export interface ImageRepository {
  /**
   * Uploads an image from URL to storage
   * @param id - Unique identifier for the image
   * @param sourceUrl - Source URL to upload from
   */
  uploadImage(id: string, sourceUrl: string): Promise<void>;
}
