import type { SocialFeedFetcher, SocialPost } from '../../../../domain';
import {
  INSTAGRAM_GRAPH_API_BASE_URL,
  INSTAGRAM_LONG_ACCESS_TOKEN,
  INSTAGRAM_USER_ID,
} from '../../../shared';
import { mapToSocialPost } from './mapper';
import type {
  InstagramMediaDetailResponse,
  InstagramMediaListResponse,
} from './types';

const DEFAULT_LIMIT = 6;

/**
 * Instagram Feed Fetcher
 *
 * Implements SocialFeedFetcher interface using Instagram Graph API.
 */
export class InstagramFeedFetcher implements SocialFeedFetcher {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
    this.params.append('access_token', INSTAGRAM_LONG_ACCESS_TOKEN);
  }

  async fetchUserMedia(limit: number = DEFAULT_LIMIT): Promise<SocialPost[]> {
    const mediaList = await this.fetchMediaList();

    if (!mediaList.data || mediaList.data.length === 0) {
      return [];
    }

    const mediaIds = mediaList.data.slice(0, limit).map((item) => item.id);
    const mediaDetails = await Promise.all(
      mediaIds.map((id) => this.fetchMediaDetail(id))
    );

    return mediaDetails.map(mapToSocialPost);
  }

  private async fetchMediaList(): Promise<InstagramMediaListResponse> {
    const url = this.buildUrl(`${INSTAGRAM_USER_ID}/media`);
    const response = await fetch(url);

    return response.json();
  }

  private async fetchMediaDetail(
    id: string
  ): Promise<InstagramMediaDetailResponse> {
    const params = new URLSearchParams(this.params);
    params.append(
      'fields',
      'id,media_type,media_url,permalink,thumbnail_url,timestamp,caption'
    );

    const url = this.buildUrl(id, params);
    const response = await fetch(url);

    return response.json();
  }

  private buildUrl(resource: string, params?: URLSearchParams): URL {
    const queryParams = params ?? this.params;
    return new URL(
      `${INSTAGRAM_GRAPH_API_BASE_URL}/${resource}?${queryParams}`
    );
  }
}
