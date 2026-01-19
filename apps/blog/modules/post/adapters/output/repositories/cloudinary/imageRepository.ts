import type { v2 as cloudinary } from 'cloudinary';
import type { ImageRepository } from '../../../../use-cases';
import { ImageUploadError } from '../../../shared';

/**
 * Cloudinary implementation of ImageRepository.
 * Handles image upload operations using Cloudinary SDK.
 */
export class CloudinaryImageRepository implements ImageRepository {
  constructor(private readonly cloudinaryInstance: typeof cloudinary) {}

  async uploadImage(id: string, sourceUrl: string): Promise<void> {
    try {
      await this.cloudinaryInstance.uploader.upload(sourceUrl, {
        public_id: id,
        overwrite: true,
        invalidate: true,
      });
    } catch (error) {
      throw new ImageUploadError(id, error);
    }
  }
}
