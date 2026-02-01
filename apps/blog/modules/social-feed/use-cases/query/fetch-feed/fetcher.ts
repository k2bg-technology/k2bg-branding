import type { SocialPost } from '../../../domain';

/**
 * SocialFeedFetcher Interface (Port)
 *
 * Re-exported from domain layer for use case dependencies.
 */
export interface SocialFeedFetcher {
  fetchUserMedia(limit?: number): Promise<SocialPost[]>;
}
