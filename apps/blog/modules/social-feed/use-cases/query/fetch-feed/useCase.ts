import type { SocialPost } from '../../../domain';
import type { SocialPostOutput } from '../../shared';
import type { SocialFeedFetcher } from './fetcher';

export interface FetchFeedInput {
  limit?: number;
}

export type FetchFeedOutput = SocialPostOutput[];

const DEFAULT_LIMIT = 6;

/**
 * Maps SocialPost entity to output DTO
 */
function toSocialPostOutput(post: SocialPost): SocialPostOutput {
  return {
    id: post.id.getValue(),
    mediaUrl: post.mediaUrl.getValue(),
    displayUrl: post.getDisplayUrl(),
    permalink: post.permalink.getValue(),
    mediaType: post.mediaType,
    caption: post.caption,
    timestamp: post.timestamp,
  };
}

/**
 * FetchFeed Use Case
 *
 * Fetches social media posts from configured social providers.
 */
export class FetchFeed {
  constructor(private readonly fetcher: SocialFeedFetcher) {}

  async execute(input: FetchFeedInput = {}): Promise<FetchFeedOutput> {
    const limit = input.limit ?? DEFAULT_LIMIT;
    const posts = await this.fetcher.fetchUserMedia(limit);

    return posts.map(toSocialPostOutput);
  }
}
