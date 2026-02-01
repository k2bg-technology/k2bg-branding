export { InstagramFeedFetcher } from './adapters';
export {
  InvalidMediaTypeError,
  InvalidMediaUrlError,
  InvalidPermalinkError,
  InvalidPostIdError,
  InvalidSocialPostError,
  MediaType,
  MediaUrl,
  Permalink,
  PostId,
  SocialFeedDomainError,
  type SocialFeedFetcher,
  SocialPost,
  type SocialPostProps,
} from './domain';
export {
  FetchFeed,
  type FetchFeedInput,
  type FetchFeedOutput,
  type SocialPostOutput,
} from './use-cases';
