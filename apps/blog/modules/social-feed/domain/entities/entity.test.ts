import { describe, expect, it } from 'vitest';
import { InvalidSocialPostError } from '../errors/errors';
import { MediaType } from '../types';
import { MediaUrl } from '../value-objects/mediaUrl';
import { Permalink } from '../value-objects/permalink';
import { PostId } from '../value-objects/postId';
import { SocialPost, type SocialPostProps } from './entity';

function createValidProps(
  overrides: Partial<SocialPostProps> = {}
): SocialPostProps {
  return {
    id: PostId.create('12345678901234567'),
    mediaUrl: MediaUrl.create('https://example.com/image.jpg'),
    permalink: Permalink.create('https://www.instagram.com/p/ABC123/'),
    mediaType: MediaType.IMAGE,
    timestamp: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  };
}

describe('SocialPost', () => {
  describe('create', () => {
    it('creates SocialPost when given valid props', () => {
      const props = createValidProps();

      const post = SocialPost.create(props);

      expect(post.id.getValue()).toBe('12345678901234567');
      expect(post.mediaUrl.getValue()).toBe('https://example.com/image.jpg');
      expect(post.permalink.getValue()).toBe(
        'https://www.instagram.com/p/ABC123/'
      );
      expect(post.mediaType).toBe(MediaType.IMAGE);
      expect(post.timestamp).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('creates SocialPost with optional caption', () => {
      const caption = 'Beautiful sunset';
      const props = createValidProps({ caption });

      const post = SocialPost.create(props);

      expect(post.caption).toBe(caption);
    });

    it('creates SocialPost with optional thumbnailUrl', () => {
      const thumbnailUrl = MediaUrl.create('https://example.com/thumbnail.jpg');
      const props = createValidProps({ thumbnailUrl });

      const post = SocialPost.create(props);

      expect(post.thumbnailUrl?.getValue()).toBe(
        'https://example.com/thumbnail.jpg'
      );
    });

    it('throws InvalidSocialPostError when id is missing', () => {
      const props = createValidProps();
      // @ts-expect-error Testing invalid input
      delete props.id;

      expect(() => SocialPost.create(props)).toThrow(InvalidSocialPostError);
    });

    it('throws InvalidSocialPostError when mediaUrl is missing', () => {
      const props = createValidProps();
      // @ts-expect-error Testing invalid input
      delete props.mediaUrl;

      expect(() => SocialPost.create(props)).toThrow(InvalidSocialPostError);
    });

    it('throws InvalidSocialPostError when permalink is missing', () => {
      const props = createValidProps();
      // @ts-expect-error Testing invalid input
      delete props.permalink;

      expect(() => SocialPost.create(props)).toThrow(InvalidSocialPostError);
    });

    it('throws InvalidSocialPostError when mediaType is missing', () => {
      const props = createValidProps();
      // @ts-expect-error Testing invalid input
      delete props.mediaType;

      expect(() => SocialPost.create(props)).toThrow(InvalidSocialPostError);
    });

    it('throws InvalidSocialPostError when timestamp is missing', () => {
      const props = createValidProps();
      // @ts-expect-error Testing invalid input
      delete props.timestamp;

      expect(() => SocialPost.create(props)).toThrow(InvalidSocialPostError);
    });
  });

  describe('getDisplayUrl', () => {
    it('returns mediaUrl for IMAGE type', () => {
      const props = createValidProps({
        mediaType: MediaType.IMAGE,
      });
      const post = SocialPost.create(props);

      expect(post.getDisplayUrl()).toBe('https://example.com/image.jpg');
    });

    it('returns thumbnailUrl for VIDEO type when available', () => {
      const thumbnailUrl = MediaUrl.create('https://example.com/thumbnail.jpg');
      const props = createValidProps({
        mediaType: MediaType.VIDEO,
        thumbnailUrl,
      });
      const post = SocialPost.create(props);

      expect(post.getDisplayUrl()).toBe('https://example.com/thumbnail.jpg');
    });

    it('returns mediaUrl for VIDEO type when thumbnailUrl is not available', () => {
      const props = createValidProps({
        mediaType: MediaType.VIDEO,
      });
      const post = SocialPost.create(props);

      expect(post.getDisplayUrl()).toBe('https://example.com/image.jpg');
    });

    it('returns mediaUrl for CAROUSEL_ALBUM type', () => {
      const props = createValidProps({
        mediaType: MediaType.CAROUSEL_ALBUM,
      });
      const post = SocialPost.create(props);

      expect(post.getDisplayUrl()).toBe('https://example.com/image.jpg');
    });
  });

  describe('equals', () => {
    it('returns true when posts have same id', () => {
      const post1 = SocialPost.create(createValidProps());
      const post2 = SocialPost.create(createValidProps());

      expect(post1.equals(post2)).toBe(true);
    });

    it('returns false when posts have different ids', () => {
      const post1 = SocialPost.create(createValidProps());
      const post2 = SocialPost.create(
        createValidProps({
          id: PostId.create('98765432109876543'),
        })
      );

      expect(post1.equals(post2)).toBe(false);
    });
  });

  describe('timestamp getter', () => {
    it('returns a copy of timestamp to prevent mutation', () => {
      const originalTimestamp = new Date('2024-01-15T10:00:00Z');
      const props = createValidProps({ timestamp: originalTimestamp });
      const post = SocialPost.create(props);

      const returnedTimestamp = post.timestamp;
      returnedTimestamp.setFullYear(2000);

      expect(post.timestamp.getFullYear()).toBe(2024);
    });
  });
});
