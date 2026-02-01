import {
  MediaType,
  MediaUrl,
  Permalink,
  PostId,
  SocialPost,
  type SocialPostProps,
} from '../../../../domain';
import type { InstagramMediaDetailResponse } from './types';

/**
 * Maps Instagram API media type string to domain MediaType
 */
function mapMediaType(mediaType: string): MediaType {
  switch (mediaType) {
    case 'IMAGE':
      return MediaType.IMAGE;
    case 'VIDEO':
      return MediaType.VIDEO;
    case 'CAROUSEL_ALBUM':
      return MediaType.CAROUSEL_ALBUM;
    default:
      return MediaType.IMAGE;
  }
}

/**
 * Maps Instagram API response to domain SocialPost entity
 */
export function mapToSocialPost(
  data: InstagramMediaDetailResponse
): SocialPost {
  const props: SocialPostProps = {
    id: PostId.create(data.id),
    mediaUrl: MediaUrl.create(data.media_url),
    permalink: Permalink.create(data.permalink),
    mediaType: mapMediaType(data.media_type),
    timestamp: new Date(data.timestamp),
    caption: data.caption,
    thumbnailUrl: data.thumbnail_url
      ? MediaUrl.create(data.thumbnail_url)
      : undefined,
  };

  return SocialPost.create(props);
}
