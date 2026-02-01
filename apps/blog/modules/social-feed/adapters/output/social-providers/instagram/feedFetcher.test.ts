import { describe, expect, it, type Mock, vi } from 'vitest';
import { MediaType } from '../../../../domain';
import { type InstagramClient, InstagramFeedFetcher } from './feedFetcher';

const TEST_USER_ID = 'test-user-id';

interface MockInstagramClient extends InstagramClient {
  fetch: Mock<InstagramClient['fetch']>;
}

function createMockClient(): MockInstagramClient {
  return {
    fetch: vi.fn(),
  };
}

function createMediaListResponse(ids: string[] = ['1', '2', '3']) {
  return {
    data: ids.map((id) => ({ id })),
  };
}

function createMediaDetailResponse(
  id: string,
  overrides: Record<string, unknown> = {}
) {
  return {
    id,
    media_type: 'IMAGE',
    media_url: `https://example.com/image-${id}.jpg`,
    permalink: `https://www.instagram.com/p/${id}/`,
    timestamp: '2024-01-15T10:00:00+0000',
    ...overrides,
  };
}

describe('InstagramFeedFetcher', () => {
  describe('fetchUserMedia', () => {
    it('returns empty array when API returns no data', async () => {
      const mockClient = createMockClient();
      mockClient.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: undefined }),
      } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      const result = await sut.fetchUserMedia();

      expect(result).toEqual([]);
    });

    it('returns empty array when API returns empty data array', async () => {
      const mockClient = createMockClient();
      mockClient.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      const result = await sut.fetchUserMedia();

      expect(result).toEqual([]);
    });

    it('fetches and maps social posts from Instagram API', async () => {
      const mockClient = createMockClient();
      mockClient.fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaListResponse(['1', '2'])),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaDetailResponse('1')),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaDetailResponse('2')),
        } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      const result = await sut.fetchUserMedia();

      expect(result).toHaveLength(2);
      expect(result[0].id.getValue()).toBe('1');
      expect(result[0].mediaType).toBe(MediaType.IMAGE);
      expect(result[1].id.getValue()).toBe('2');
    });

    it('calls client.fetch with correct userId for media list', async () => {
      const mockClient = createMockClient();
      mockClient.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      await sut.fetchUserMedia();

      expect(mockClient.fetch).toHaveBeenCalledWith(`${TEST_USER_ID}/media`);
    });

    it('calls client.fetch with fields for media detail', async () => {
      const mockClient = createMockClient();
      mockClient.fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaListResponse(['1'])),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaDetailResponse('1')),
        } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      await sut.fetchUserMedia();

      expect(mockClient.fetch).toHaveBeenCalledWith('1', {
        fields:
          'id,media_type,media_url,permalink,thumbnail_url,timestamp,caption',
      });
    });

    it('respects limit parameter', async () => {
      const mockClient = createMockClient();
      mockClient.fetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve(createMediaListResponse(['1', '2', '3', '4', '5'])),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaDetailResponse('1')),
        } as Response)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaDetailResponse('2')),
        } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);
      const limit = 2;

      const result = await sut.fetchUserMedia(limit);

      expect(result).toHaveLength(2);
      expect(mockClient.fetch).toHaveBeenCalledTimes(3);
    });

    it('maps VIDEO type with thumbnailUrl correctly', async () => {
      const mockClient = createMockClient();
      mockClient.fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaListResponse(['1'])),
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve(
              createMediaDetailResponse('1', {
                media_type: 'VIDEO',
                thumbnail_url: 'https://example.com/thumb.jpg',
              })
            ),
        } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      const result = await sut.fetchUserMedia();

      expect(result[0].mediaType).toBe(MediaType.VIDEO);
      expect(result[0].thumbnailUrl?.getValue()).toBe(
        'https://example.com/thumb.jpg'
      );
    });

    it('includes caption when available', async () => {
      const caption = 'Test caption';
      const mockClient = createMockClient();
      mockClient.fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(createMediaListResponse(['1'])),
        } as Response)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve(createMediaDetailResponse('1', { caption })),
        } as Response);
      const sut = new InstagramFeedFetcher(mockClient, TEST_USER_ID);

      const result = await sut.fetchUserMedia();

      expect(result[0].caption).toBe(caption);
    });
  });
});
