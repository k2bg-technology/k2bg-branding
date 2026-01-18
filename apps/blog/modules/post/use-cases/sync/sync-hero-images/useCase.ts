import { SyncError } from '../../shared';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from './externalImageSource';
import type { ImageRepository } from './imageRepository';

export interface SyncHeroImagesOutput {
  uploadedImages: ImageSourceRecord[];
  count: number;
  failedCount: number;
}

/**
 * SyncHeroImages Use Case
 *
 * Syncs hero images from multiple external sources to image storage
 */
export class SyncHeroImages {
  constructor(
    private readonly imageSources: ExternalImageSource[],
    private readonly imageRepository: ImageRepository
  ) {}

  async execute(): Promise<SyncHeroImagesOutput> {
    try {
      // Collect images from all sources
      const allImages = await this.collectImagesFromAllSources();

      // Upload all images in parallel
      const results = await this.uploadImages(allImages);

      const uploaded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      return {
        uploadedImages: uploaded.map((r) => r.image),
        count: uploaded.length,
        failedCount: failed.length,
      };
    } catch (error) {
      if (error instanceof SyncError) {
        throw error;
      }
      throw new SyncError(
        `Failed to sync hero images: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async collectImagesFromAllSources(): Promise<ImageSourceRecord[]> {
    const results = await Promise.all(
      this.imageSources.map((source) => source.fetchImageSources())
    );
    return results.flat();
  }

  private async uploadImages(
    images: ImageSourceRecord[]
  ): Promise<Array<{ image: ImageSourceRecord; success: boolean }>> {
    return Promise.all(
      images.map(async (image) => {
        try {
          await this.imageRepository.uploadImage(image.id, image.url);
          return { image, success: true };
        } catch {
          return { image, success: false };
        }
      })
    );
  }
}
