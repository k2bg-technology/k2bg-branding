import { buildImageUrl } from './client';

/**
 * Generate an optimized image URL with automatic format and quality.
 */
export function getOptimizedImageUrl(publicId: string): string {
  return buildImageUrl(publicId, {
    format: 'auto',
    quality: 'auto',
  });
}
