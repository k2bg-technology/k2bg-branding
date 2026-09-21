import { FetchFeed, InstagramFeedFetcher } from '../../modules/social-feed';
import { getInstagramClient, getInstagramUserId } from '../instagram';

/**
 * Creates FetchFeed use case with Instagram adapter
 */
export function createFetchFeedUseCase(): FetchFeed {
  const client = getInstagramClient();
  const userId = getInstagramUserId();

  return new FetchFeed(new InstagramFeedFetcher(client, userId));
}
