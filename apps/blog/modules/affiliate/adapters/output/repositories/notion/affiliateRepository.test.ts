import { APIResponseError } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateBanner,
  AffiliateId,
  AffiliateType,
} from '../../../../domain';
import { ExternalSourceError } from '../../../shared';
import { createNotionAffiliatePageResponse } from '../../../shared/testing';

import { NotionAffiliateRepository } from './affiliateRepository';

describe('NotionAffiliateRepository', () => {
  const createMockNotionClient = () => ({
    pages: {
      retrieve: vi.fn(),
    },
    databases: {
      query: vi.fn(),
    },
  });

  describe('findById', () => {
    it('returns domain entity when page exists', async () => {
      const mockClient = createMockNotionClient();
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Banner',
      });
      mockClient.pages.retrieve.mockResolvedValue(page);
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const affiliateId = AffiliateId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(affiliateId);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(AffiliateBanner);
      expect(result?.type).toBe(AffiliateType.BANNER);
      expect(result?.name.getValue()).toBe('Test Banner');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: '550e8400-e29b-41d4-a716-446655440001',
      });
    });

    it('returns null when page not found (404)', async () => {
      const mockClient = createMockNotionClient();
      const error = Object.assign(new Error('Not found'), {
        status: 404,
        code: 'object_not_found',
      });
      Object.setPrototypeOf(error, APIResponseError.prototype);
      mockClient.pages.retrieve.mockRejectedValue(error);
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const affiliateId = AffiliateId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(affiliateId);

      expect(result).toBeNull();
    });

    it('throws ExternalSourceError on API error', async () => {
      const mockClient = createMockNotionClient();
      const error = Object.assign(new Error('Internal error'), {
        status: 500,
        code: 'internal_server_error',
      });
      Object.setPrototypeOf(error, APIResponseError.prototype);
      mockClient.pages.retrieve.mockRejectedValue(error);
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const affiliateId = AffiliateId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      await expect(sut.findById(affiliateId)).rejects.toThrow(
        ExternalSourceError
      );
    });

    it('returns null when page has no properties', async () => {
      const mockClient = createMockNotionClient();
      mockClient.pages.retrieve.mockResolvedValue({
        object: 'page',
        id: '550e8400-e29b-41d4-a716-446655440001',
      });
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const affiliateId = AffiliateId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(affiliateId);

      expect(result).toBeNull();
    });
  });

  describe('findAllImageSources', () => {
    it('filters by Banner and Product types', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      await sut.findAllImageSources();

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
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.findAllImageSources();

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
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.findAllImageSources();

      expect(result).toHaveLength(1);
      expect(result[0].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
    });

    it('returns empty array when no results', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.findAllImageSources();

      expect(result).toEqual([]);
    });

    it('throws ExternalSourceError on API error', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      await expect(sut.findAllImageSources()).rejects.toThrow(
        ExternalSourceError
      );
    });
  });
});
