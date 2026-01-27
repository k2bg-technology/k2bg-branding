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

  describe('findByIds', () => {
    it('returns empty map when ids array is empty', async () => {
      const mockClient = createMockNotionClient();
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );

      const result = await sut.findByIds([]);

      expect(result.size).toBe(0);
      expect(mockClient.pages.retrieve).not.toHaveBeenCalled();
    });

    it('returns map with affiliates when pages exist', async () => {
      const mockClient = createMockNotionClient();
      const page1 = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Banner 1',
      });
      const page2 = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_TEXT',
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Text 1',
      });
      mockClient.pages.retrieve
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const ids = [
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440002'),
      ];

      const result = await sut.findByIds(ids);

      expect(result.size).toBe(2);
      expect(
        result.get('550e8400-e29b-41d4-a716-446655440001')?.name.getValue()
      ).toBe('Banner 1');
      expect(
        result.get('550e8400-e29b-41d4-a716-446655440002')?.name.getValue()
      ).toBe('Text 1');
    });

    it('skips not found pages (404)', async () => {
      const mockClient = createMockNotionClient();
      const page = createNotionAffiliatePageResponse({
        type: 'AFFILIATE_BANNER',
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Banner',
      });
      const error = Object.assign(new Error('Not found'), {
        status: 404,
        code: 'object_not_found',
      });
      Object.setPrototypeOf(error, APIResponseError.prototype);
      mockClient.pages.retrieve
        .mockResolvedValueOnce(page)
        .mockRejectedValueOnce(error);
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const ids = [
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440002'),
      ];

      const result = await sut.findByIds(ids);

      expect(result.size).toBe(1);
      expect(result.has('550e8400-e29b-41d4-a716-446655440001')).toBe(true);
      expect(result.has('550e8400-e29b-41d4-a716-446655440002')).toBe(false);
    });

    it('throws ExternalSourceError on non-404 API error', async () => {
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
      const ids = [
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
      ];

      await expect(sut.findByIds(ids)).rejects.toThrow(ExternalSourceError);
    });

    it('fetches pages in parallel', async () => {
      const mockClient = createMockNotionClient();
      const callOrder: string[] = [];
      mockClient.pages.retrieve.mockImplementation(async ({ page_id }) => {
        callOrder.push(`start-${page_id}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        callOrder.push(`end-${page_id}`);
        return createNotionAffiliatePageResponse({
          type: 'AFFILIATE_BANNER',
          id: page_id,
        });
      });
      const sut = new NotionAffiliateRepository(
        mockClient as never,
        'test-db-id'
      );
      const ids = [
        AffiliateId.reconstitute('id1'),
        AffiliateId.reconstitute('id2'),
      ];

      await sut.findByIds(ids);

      // Both starts should happen before any ends (parallel execution)
      expect(callOrder.indexOf('start-id1')).toBeLessThan(
        callOrder.indexOf('end-id1')
      );
      expect(callOrder.indexOf('start-id2')).toBeLessThan(
        callOrder.indexOf('end-id2')
      );
      // Both starts should happen before both ends
      expect(callOrder.indexOf('start-id2')).toBeLessThan(
        callOrder.indexOf('end-id1')
      );
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
