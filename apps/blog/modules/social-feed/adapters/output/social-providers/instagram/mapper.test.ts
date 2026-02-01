import { describe, expect, it } from 'vitest';
import { MediaType } from '../../../../domain';
import { mapToSocialPost } from './mapper';
import type { InstagramMediaDetailResponse } from './types';

function createInstagramResponse(
  overrides: Partial<InstagramMediaDetailResponse> = {}
): InstagramMediaDetailResponse {
  return {
    id: '12345678901234567',
    media_type: 'IMAGE',
    media_url: 'https://example.com/image.jpg',
    permalink: 'https://www.instagram.com/p/ABC123/',
    timestamp: '2024-01-15T10:00:00+0000',
    ...overrides,
  };
}

describe('mapToSocialPost', () => {
  it('maps Instagram response to SocialPost with IMAGE type', () => {
    const response = createInstagramResponse({ media_type: 'IMAGE' });

    const post = mapToSocialPost(response);

    expect(post.id.getValue()).toBe('12345678901234567');
    expect(post.mediaUrl.getValue()).toBe('https://example.com/image.jpg');
    expect(post.permalink.getValue()).toBe(
      'https://www.instagram.com/p/ABC123/'
    );
    expect(post.mediaType).toBe(MediaType.IMAGE);
    expect(post.timestamp).toEqual(new Date('2024-01-15T10:00:00+0000'));
  });

  it('maps Instagram response to SocialPost with VIDEO type', () => {
    const response = createInstagramResponse({ media_type: 'VIDEO' });

    const post = mapToSocialPost(response);

    expect(post.mediaType).toBe(MediaType.VIDEO);
  });

  it('maps Instagram response to SocialPost with CAROUSEL_ALBUM type', () => {
    const response = createInstagramResponse({ media_type: 'CAROUSEL_ALBUM' });

    const post = mapToSocialPost(response);

    expect(post.mediaType).toBe(MediaType.CAROUSEL_ALBUM);
  });

  it('maps unknown media type to IMAGE as default', () => {
    const response = createInstagramResponse({ media_type: 'UNKNOWN_TYPE' });

    const post = mapToSocialPost(response);

    expect(post.mediaType).toBe(MediaType.IMAGE);
  });

  it('maps caption when provided', () => {
    const caption = 'Beautiful sunset';
    const response = createInstagramResponse({ caption });

    const post = mapToSocialPost(response);

    expect(post.caption).toBe(caption);
  });

  it('maps thumbnailUrl when provided', () => {
    const thumbnailUrl = 'https://example.com/thumbnail.jpg';
    const response = createInstagramResponse({ thumbnail_url: thumbnailUrl });

    const post = mapToSocialPost(response);

    expect(post.thumbnailUrl?.getValue()).toBe(thumbnailUrl);
  });

  it('sets thumbnailUrl to undefined when not provided', () => {
    const response = createInstagramResponse();

    const post = mapToSocialPost(response);

    expect(post.thumbnailUrl).toBeUndefined();
  });
});
