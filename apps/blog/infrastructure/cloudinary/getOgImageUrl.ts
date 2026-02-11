import type { OgImageUrlGenerator } from '../../modules/post/use-cases/shared/ogImageUrlGenerator';

/**
 * Cloudinary implementation of OgImageUrlGenerator.
 * Generates URLs optimized for social media sharing (1200x630, JPG).
 */
export class CloudinaryOgImageUrlGenerator implements OgImageUrlGenerator {
  generate(publicId: string): string {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/${publicId}`;
  }
}
