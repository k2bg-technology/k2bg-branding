import { describe, expect, it, type Mock, vi } from 'vitest';
import {
  MediaType,
  MediaUrl,
  Permalink,
  PostId,
  SocialPost,
} from '../../../domain';
import type { SocialFeedFetcher } from './fetcher';
import { FetchFeed } from './useCase';

interface MockSocialFeedFetcher extends SocialFeedFetcher {
  fetchUserMedia: Mock<SocialFeedFetcher['fetchUserMedia']>;
}

function createMockFetcher(posts: SocialPost[] = []): MockSocialFeedFetcher {
  return {
    fetchUserMedia: vi.fn().mockResolvedValue(posts),
  };
}

function createSocialPost(id: string): SocialPost {
  return SocialPost.create({
    id: PostId.create(id),
    mediaUrl: MediaUrl.create(`https://example.com/image-${id}.jpg`),
    permalink: Permalink.create(`https://www.instagram.com/p/${id}/`),
    mediaType: MediaType.IMAGE,
    timestamp: new Date('2024-01-15T10:00:00Z'),
  });
}

describe('FetchFeed', () => {
  describe('execute', () => {
    it('returns empty array when no posts are available', async () => {
      const mockFetcher = createMockFetcher([]);
      const sut = new FetchFeed(mockFetcher);

      const result = await sut.execute();

      expect(result).toEqual([]);
    });

    it('returns mapped social post outputs', async () => {
      const post = createSocialPost('1');
      const mockFetcher = createMockFetcher([post]);
      const sut = new FetchFeed(mockFetcher);

      const result = await sut.execute();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].mediaUrl).toBe('https://example.com/image-1.jpg');
      expect(result[0].displayUrl).toBe('https://example.com/image-1.jpg');
      expect(result[0].permalink).toBe('https://www.instagram.com/p/1/');
      expect(result[0].mediaType).toBe(MediaType.IMAGE);
      expect(result[0].timestamp).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('returns multiple posts in order', async () => {
      const post1 = createSocialPost('1');
      const post2 = createSocialPost('2');
      const post3 = createSocialPost('3');
      const mockFetcher = createMockFetcher([post1, post2, post3]);
      const sut = new FetchFeed(mockFetcher);

      const result = await sut.execute();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('uses default limit of 6 when not specified', async () => {
      const mockFetcher = createMockFetcher([]);
      const sut = new FetchFeed(mockFetcher);

      await sut.execute();

      const defaultLimit = 6;
      expect(mockFetcher.fetchUserMedia).toHaveBeenCalledWith(defaultLimit);
    });

    it('passes custom limit to fetcher', async () => {
      const mockFetcher = createMockFetcher([]);
      const sut = new FetchFeed(mockFetcher);
      const customLimit = 10;

      await sut.execute({ limit: customLimit });

      expect(mockFetcher.fetchUserMedia).toHaveBeenCalledWith(customLimit);
    });

    it('maps VIDEO type with displayUrl from thumbnail', async () => {
      const post = SocialPost.create({
        id: PostId.create('1'),
        mediaUrl: MediaUrl.create('https://example.com/video.mp4'),
        permalink: Permalink.create('https://www.instagram.com/p/1/'),
        mediaType: MediaType.VIDEO,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        thumbnailUrl: MediaUrl.create('https://example.com/thumb.jpg'),
      });
      const mockFetcher = createMockFetcher([post]);
      const sut = new FetchFeed(mockFetcher);

      const result = await sut.execute();

      expect(result[0].mediaUrl).toBe('https://example.com/video.mp4');
      expect(result[0].displayUrl).toBe('https://example.com/thumb.jpg');
    });

    it('includes caption when available', async () => {
      const caption = 'Beautiful sunset';
      const post = SocialPost.create({
        id: PostId.create('1'),
        mediaUrl: MediaUrl.create('https://example.com/image.jpg'),
        permalink: Permalink.create('https://www.instagram.com/p/1/'),
        mediaType: MediaType.IMAGE,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        caption,
      });
      const mockFetcher = createMockFetcher([post]);
      const sut = new FetchFeed(mockFetcher);

      const result = await sut.execute();

      expect(result[0].caption).toBe(caption);
    });
  });
});
