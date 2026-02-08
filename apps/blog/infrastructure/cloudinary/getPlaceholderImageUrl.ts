import { buildImageUrl } from './client';

/**
 * Generate a blurred placeholder image URL for progressive loading.
 */
export function getPlaceholderImageUrl(publicId: string): string {
  return buildImageUrl(publicId, {
    format: 'auto',
    quality: 'auto',
    effect: 'blur:1000',
    width: 100,
  });
}
