import { describe, expect, it, vi } from 'vitest';

import { ExternalSourceError } from '../../../shared';
import { createNotionAffiliatePageResponse } from '../../../shared/testing';

import { NotionFetchAllImageSourcesQueryService } from './fetchAllImageSourcesQueryService';

describe('NotionFetchAllImageSourcesQueryService', () => {
  const createMockNotionClient = () => ({
    databases: {
      query: vi.fn(),
    },
  });

  describe('fetchAllImageSources', () => {
    it('filters by Banner and Product types', async () => {
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
          or: [
            { property: 'type', select: { equals: 'AFFILIATE_BANNER' } },
            { property: 'type', select: { equals: 'AFFILIATE_PRODUCT' } },
          ],
        },
      });
    });

    it('returns ImageSource array for valid pages', async () => {
      const mockClient = createMockNotionClient();
      const bannerPage = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        imageSourceUrl: 'https://example.com/banner.jpg',
      });
      const productPage = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_PRODUCT',
        id: '550e8400-e29b-41d4-a716-446655440002',
        imageSourceUrl: 'https://example.com/product.jpg',
      });
      mockClient.databases.query.mockResolvedValue({
        results: [bannerPage, productPage],
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
      expect(result[0].url.getValue()).toBe('https://example.com/banner.jpg');
      expect(result[1].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440002'
      );
      expect(result[1].url.getValue()).toBe('https://example.com/product.jpg');
    });

    it('filters out pages without image URLs', async () => {
      const mockClient = createMockNotionClient();
      const pageWithImage = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        imageSourceUrl: 'https://example.com/image.jpg',
      });
      const pageWithoutImage = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440002',
      });
      // Remove image URL from second page
      (
        pageWithoutImage.properties.imageSourceFile as unknown as { files: [] }
      ).files = [];
      (
        pageWithoutImage.properties.imageSourceUrl as unknown as { url: null }
      ).url = null;

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
