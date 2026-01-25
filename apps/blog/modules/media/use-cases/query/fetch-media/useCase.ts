import { MediaId, type MediaRepository } from '../../../domain';
import {
  MediaNotFoundError,
  type MediaOutput,
  toMediaOutput,
} from '../../shared';

export interface FetchMediaInput {
  id: string;
}

export interface FetchMediaOutput {
  media: MediaOutput;
}

/**
 * FetchMedia Use Case
 *
 * Fetches a single media by its ID.
 */
export class FetchMedia {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(input: FetchMediaInput): Promise<FetchMediaOutput> {
    const mediaId = MediaId.create(input.id);
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new MediaNotFoundError(input.id);
    }

    return {
      media: toMediaOutput(media),
    };
  }
}
