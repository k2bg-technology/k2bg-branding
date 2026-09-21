import type { SocialPost } from '../entities/entity';

export interface SocialFeedFetcher {
  fetchUserMedia(limit?: number): Promise<SocialPost[]>;
}
