import type { SocialPost } from '../entities/entity';

/**
 * SocialFeedFetcher Interface (Output Port)
 *
 * Defines the contract for fetching social media posts.
 * This interface is part of the domain layer and should be
 * implemented by adapters for specific social providers (e.g., Instagram).
 */
export interface SocialFeedFetcher {
  /**
   * Fetch social media posts
   * @param limit - Maximum number of posts to fetch (optional)
   * @returns Promise resolving to an array of SocialPost entities
   */
  fetchUserMedia(limit?: number): Promise<SocialPost[]>;
}
