import type { OptimizationOptions } from './types';
import { buildImageUrl } from './client';

/**
 * Generate an optimized image URL with automatic format and quality.
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: OptimizationOptions
): string {
  return buildImageUrl(publicId, {
    format: 'auto',
    quality: 'auto',
    version: options?.version,
  });
}
