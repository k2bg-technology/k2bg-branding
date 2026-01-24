import type { ImageSource } from '../../../domain';

/**
 * Query service interface for fetching all image sources
 */
export interface FetchAllImageSourcesQueryService {
  fetchAllImageSources(): Promise<ImageSource[]>;
}
