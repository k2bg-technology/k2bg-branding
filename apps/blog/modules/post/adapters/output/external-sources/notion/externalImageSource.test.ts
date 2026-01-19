import { describe, expect, it, vi } from 'vitest';
import { createNotionPageResponse, ExternalSourceError } from '../../../shared';
import { NotionExternalImageSource } from './externalImageSource';

describe('NotionExternalImageSource', () => {
  const createMockNotionClient = () => ({
    databases: {
      query: vi.fn(),
    },
  });

  describe('fetchImageSources', () => {
    it('fetches and maps image sources from Notion', async () => {
      const mockClient = createMockNotionClient();
      const notionPages = [
        createNotionPageResponse({
          id: '00000000-0000-4000-a000-000000000001',
        }),
        createNotionPageResponse({
          id: '00000000-0000-4000-a000-000000000002',
        }),
      ];
      mockClient.databases.query.mockResolvedValue({ results: notionPages });

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      const result = await sut.fetchImageSources();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '00000000-0000-4000-a000-000000000001',
        url: 'https://example.com/image.jpg',
      });
    });

    it('filters by PUBLISHED status', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      await sut.fetchImageSources();

      expect(mockClient.databases.query).toHaveBeenCalledWith(
        expect.objectContaining({
          database_id: 'test-database-id',
          filter: {
            property: 'status',
            status: { equals: 'PUBLISHED' },
          },
        })
      );
    });

    it('filters out pages without image URLs', async () => {
      const mockClient = createMockNotionClient();
      const pageWithImage = createNotionPageResponse({
        id: '00000000-0000-4000-a000-000000000001',
      });
      const pageWithoutImage = createNotionPageResponse({
        id: '00000000-0000-4000-a000-000000000002',
        properties: {
          ...(createNotionPageResponse().properties as Record<string, unknown>),
          imageUrl: { type: 'files', files: [] },
        },
      });
      mockClient.databases.query.mockResolvedValue({
        results: [pageWithImage, pageWithoutImage],
      });

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      const result = await sut.fetchImageSources();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('00000000-0000-4000-a000-000000000001');
    });

    it('returns empty array when no posts exist', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      const result = await sut.fetchImageSources();

      expect(result).toEqual([]);
    });

    it('throws ExternalSourceError on Notion API error', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      await expect(sut.fetchImageSources()).rejects.toThrow(
        ExternalSourceError
      );
    });

    it('includes source name in error', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));

      const sut = new NotionExternalImageSource(
        mockClient as never,
        'test-database-id'
      );

      await expect(sut.fetchImageSources()).rejects.toThrow('Notion');
    });
  });
});
