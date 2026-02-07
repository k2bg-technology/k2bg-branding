import type { SocialFeedFetcher, SocialPost } from '../../../../domain';
import { socialFeedLogger } from '../../../shared/logger';
import { mapToSocialPost } from './mapper';
import type {
  InstagramMediaDetailResponse,
  InstagramMediaListResponse,
} from './types';

const DEFAULT_LIMIT = 6;
const MEDIA_FIELDS =
  'id,media_type,media_url,permalink,thumbnail_url,timestamp,caption';

/**
 * Instagram client interface for API calls
 */
export interface InstagramClient {
  fetch(resource: string, params?: Record<string, string>): Promise<Response>;
}

/**
 * Instagram Feed Fetcher
 *
 * Implements SocialFeedFetcher interface using Instagram Graph API.
 * Receives client and userId through dependency injection.
 */
export class InstagramFeedFetcher implements SocialFeedFetcher {
  constructor(
    private readonly client: InstagramClient,
    private readonly userId: string
  ) {}

  async fetchUserMedia(limit: number = DEFAULT_LIMIT): Promise<SocialPost[]> {
    try {
      const mediaList = await this.fetchMediaList();

      if (!mediaList.data || mediaList.data.length === 0) {
        return [];
      }

      const mediaIds = mediaList.data.slice(0, limit).map((item) => item.id);
      const mediaDetails = await Promise.all(
        mediaIds.map((id) => this.fetchMediaDetail(id))
      );

      const posts = mediaDetails.map(mapToSocialPost);
      socialFeedLogger.info({ count: posts.length }, 'Fetched Instagram feed');
      return posts;
    } catch (error) {
      socialFeedLogger.error({ err: error }, 'Failed to fetch Instagram feed');
      throw error;
    }
  }

  private async fetchMediaList(): Promise<InstagramMediaListResponse> {
    const response = await this.client.fetch(`${this.userId}/media`);
    return response.json();
  }

  private async fetchMediaDetail(
    id: string
  ): Promise<InstagramMediaDetailResponse> {
    const response = await this.client.fetch(id, { fields: MEDIA_FIELDS });
    return response.json();
  }
}
