import type { Media } from '../../domain';
import type { MediaOutput } from './types';

/**
 * Maps Media entity to MediaOutput DTO
 */
export const toMediaOutput = (media: Media): MediaOutput => ({
  id: media.id.getValue(),
  name: media.name.getValue(),
  type: media.type,
  sourceFile: media.sourceFile?.getValue() ?? null,
  sourceUrl: media.sourceUrl?.getValue() ?? null,
  targetUrl: media.targetUrl?.getValue() ?? null,
  width: media.width?.getValue() ?? null,
  height: media.height?.getValue() ?? null,
  extension: media.extension?.getValue() ?? null,
  effectiveSource: media.getEffectiveSource(),
});
