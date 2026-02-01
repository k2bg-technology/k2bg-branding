export { SocialPost, type SocialPostProps } from './entities/entity';
export {
  InvalidMediaTypeError,
  InvalidMediaUrlError,
  InvalidPermalinkError,
  InvalidPostIdError,
  InvalidSocialPostError,
  SocialFeedDomainError,
} from './errors/errors';
export type { SocialFeedFetcher } from './repositories/fetcher';
export { MediaType } from './types';
export { MediaUrl } from './value-objects/mediaUrl';
export { Permalink } from './value-objects/permalink';
export { PostId } from './value-objects/postId';
