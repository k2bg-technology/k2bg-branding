import { InvalidSocialPostError } from '../errors/errors';
import type { MediaType } from '../types';
import type { MediaUrl } from '../value-objects/mediaUrl';
import type { Permalink } from '../value-objects/permalink';
import type { PostId } from '../value-objects/postId';

/**
 * Props for reconstituting a SocialPost from external data
 */
export interface SocialPostProps {
  id: PostId;
  mediaUrl: MediaUrl;
  permalink: Permalink;
  mediaType: MediaType;
  caption?: string;
  timestamp: Date;
  thumbnailUrl?: MediaUrl;
}

/**
 * SocialPost Entity
 *
 * Represents a post from a social media platform.
 * This is an abstracted entity that can be created from various social providers.
 */
export class SocialPost {
  private constructor(
    private readonly _id: PostId,
    private readonly _mediaUrl: MediaUrl,
    private readonly _permalink: Permalink,
    private readonly _mediaType: MediaType,
    private readonly _caption: string | undefined,
    private readonly _timestamp: Date,
    private readonly _thumbnailUrl: MediaUrl | undefined
  ) {}

  // ==========================================================================
  // Getters
  // ==========================================================================

  get id(): PostId {
    return this._id;
  }

  get mediaUrl(): MediaUrl {
    return this._mediaUrl;
  }

  get permalink(): Permalink {
    return this._permalink;
  }

  get mediaType(): MediaType {
    return this._mediaType;
  }

  get caption(): string | undefined {
    return this._caption;
  }

  get timestamp(): Date {
    return new Date(this._timestamp);
  }

  get thumbnailUrl(): MediaUrl | undefined {
    return this._thumbnailUrl;
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  /**
   * Returns the display URL for the post.
   * For videos, returns thumbnail URL if available, otherwise media URL.
   * For images, returns the media URL.
   */
  getDisplayUrl(): string {
    if (this._mediaType === 'VIDEO' && this._thumbnailUrl) {
      return this._thumbnailUrl.getValue();
    }
    return this._mediaUrl.getValue();
  }

  equals(other: SocialPost): boolean {
    return this._id.equals(other._id);
  }

  // ==========================================================================
  // Factory Methods
  // ==========================================================================

  static create(props: SocialPostProps): SocialPost {
    if (!props.id) {
      throw new InvalidSocialPostError('SocialPost must have an id');
    }
    if (!props.mediaUrl) {
      throw new InvalidSocialPostError('SocialPost must have a mediaUrl');
    }
    if (!props.permalink) {
      throw new InvalidSocialPostError('SocialPost must have a permalink');
    }
    if (!props.mediaType) {
      throw new InvalidSocialPostError('SocialPost must have a mediaType');
    }
    if (!props.timestamp) {
      throw new InvalidSocialPostError('SocialPost must have a timestamp');
    }

    return new SocialPost(
      props.id,
      props.mediaUrl,
      props.permalink,
      props.mediaType,
      props.caption,
      props.timestamp,
      props.thumbnailUrl
    );
  }
}
