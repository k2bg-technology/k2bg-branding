import type { ImageSource } from '../../domain';
import type { ImageSourceOutput } from './types';

/**
 * Maps domain ImageSource to ImageSourceOutput DTO
 */
export const toImageSourceOutput = (
  source: ImageSource
): ImageSourceOutput => ({
  id: source.id.getValue(),
  url: source.url.getValue(),
});
