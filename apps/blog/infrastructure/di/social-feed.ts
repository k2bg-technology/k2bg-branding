import { getInstagramClient, getInstagramUserId } from '../instagram';
import { FetchFeed, InstagramFeedFetcher } from '../../modules/social-feed';

/**
 * Creates FetchFeed use case with Instagram adapter
 */
export function createFetchFeedUseCase(): FetchFeed {
  const client = getInstagramClient();
  const userId = getInstagramUserId();

  return new FetchFeed(new InstagramFeedFetcher(client, userId));
}
