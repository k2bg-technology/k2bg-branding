import { FetchFeed, InstagramFeedFetcher } from '../../modules/social-feed';

/**
 * Creates FetchFeed use case with Instagram adapter
 */
export function createFetchFeedUseCase(): FetchFeed {
  return new FetchFeed(new InstagramFeedFetcher());
}
