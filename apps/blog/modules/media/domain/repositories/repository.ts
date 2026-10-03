import type { Media } from '../entities';
import type { MediaId, SourceUrl } from '../value-objects';

export interface ImageSource {
  id: MediaId;
  url: SourceUrl;
}

export interface MediaRepository {
  findById(id: MediaId): Promise<Media | null>;
}
