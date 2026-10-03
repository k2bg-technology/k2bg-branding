import type { v2 as cloudinary } from 'cloudinary';
import type { ImageRepository } from '../../../../use-cases';
import { ImageUploadError, postLogger } from '../../../shared';

export class CloudinaryImageRepository implements ImageRepository {
  constructor(private readonly cloudinaryInstance: typeof cloudinary) {}

  async uploadImage(id: string, sourceUrl: string): Promise<void> {
    try {
      await this.cloudinaryInstance.uploader.upload(sourceUrl, {
        public_id: id,
        overwrite: true,
        invalidate: true,
      });
      postLogger.info({ imageId: id }, 'Image uploaded to Cloudinary');
    } catch (error) {
      postLogger.error(
        { err: error, imageId: id },
        'Failed to upload image to Cloudinary'
      );
      throw new ImageUploadError(id, error);
    }
  }
}
