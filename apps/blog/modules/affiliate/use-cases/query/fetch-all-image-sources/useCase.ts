import { type ImageSourceOutput, toImageSourceOutput } from '../../shared';
import type { FetchAllImageSourcesQueryService } from './queryService';

export type FetchAllImageSourcesOutput = ImageSourceOutput[];

/**
 * FetchAllImageSources Use Case
 *
 * Retrieves all image sources from Banner and Product affiliates.
 * Used for batch image processing and CDN uploads.
 */
export class FetchAllImageSources {
  constructor(
    private readonly queryService: FetchAllImageSourcesQueryService
  ) {}

  async execute(): Promise<FetchAllImageSourcesOutput> {
    const imageSources = await this.queryService.fetchAllImageSources();

    return imageSources.map(toImageSourceOutput);
  }
}
