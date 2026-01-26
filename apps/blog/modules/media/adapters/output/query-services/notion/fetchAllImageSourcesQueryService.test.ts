import { describe, expect, it, vi } from 'vitest';

import {
  createNotionMediaPageResponse,
  ExternalSourceError,
  NOTION_MEDIA_TYPES,
} from '../../../shared';

import { NotionFetchAllImageSourcesQueryService } from './fetchAllImageSourcesQueryService';

describe('NotionFetchAllImageSourcesQueryService', () => {
  const createMockNotionClient = () => ({
    databases: {
      query: vi.fn(),
    },
  });

  describe('fetchAllImageSources', () => {
    it('filters by MEDIA_IMAGE type in query', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionFetchAllImageSourcesQueryService(
        mockClient as never,
        'test-db-id'
      );

      await sut.fetchAllImageSources();

      expect(mockClient.databases.query).toHaveBeenCalledWith({
        database_id: 'test-db-id',
        filter: {
          property: 'type',
          select: {
            equals: NOTION_MEDIA_TYPES.IMAGE,
          },
        },
      });
    });

    it('returns ImageSource array for valid pages', async () => {
      const mockClient = createMockNotionClient();
      const page1 = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        id: '550e8400-e29b-41d4-a716-446655440001',
        sourceUrl: 'https://example.com/image1.jpg',
      });
      const page2 = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        id: '550e8400-e29b-41d4-a716-446655440002',
        sourceUrl: 'https://example.com/image2.jpg',
      });
      mockClient.databases.query.mockResolvedValue({
        results: [page1, page2],
      });
      const sut = new NotionFetchAllImageSourcesQueryService(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.fetchAllImageSources();

      expect(result).toHaveLength(2);
      expect(result[0].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result[0].url.getValue()).toBe('https://example.com/image1.jpg');
      expect(result[1].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440002'
      );
      expect(result[1].url.getValue()).toBe('https://example.com/image2.jpg');
    });

    it('filters out pages without image URLs', async () => {
      const mockClient = createMockNotionClient();
      const pageWithImage = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        id: '550e8400-e29b-41d4-a716-446655440001',
        sourceUrl: 'https://example.com/image.jpg',
      });
      const pageWithoutImage = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        id: '550e8400-e29b-41d4-a716-446655440002',
      });
      // Remove sources from second page
      (
        pageWithoutImage.properties.sourceFile as unknown as { files: [] }
      ).files = [];
      (pageWithoutImage.properties.sourceUrl as unknown as { url: null }).url =
        null;

      mockClient.databases.query.mockResolvedValue({
        results: [pageWithImage, pageWithoutImage],
      });
      const sut = new NotionFetchAllImageSourcesQueryService(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.fetchAllImageSources();

      expect(result).toHaveLength(1);
      expect(result[0].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
    });

    it('returns empty array when no results', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionFetchAllImageSourcesQueryService(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.fetchAllImageSources();

      expect(result).toEqual([]);
    });

    it('throws ExternalSourceError on API error', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));
      const sut = new NotionFetchAllImageSourcesQueryService(
        mockClient as never,
        'test-db-id'
      );

      await expect(sut.fetchAllImageSources()).rejects.toThrow(
        ExternalSourceError
      );
    });
  });
});
