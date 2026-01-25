import type { MediaType } from '../../domain';

/**
 * Output type for media image source data
 */
export interface ImageSourceOutput {
  id: string;
  url: string;
}

/**
 * Output type for Media entity
 */
export interface MediaOutput {
  id: string;
  name: string;
  type: MediaType;
  sourceFile: string | null;
  sourceUrl: string | null;
  targetUrl: string | null;
  width: number | null;
  height: number | null;
  extension: string | null;
  effectiveSource: string | null;
}
