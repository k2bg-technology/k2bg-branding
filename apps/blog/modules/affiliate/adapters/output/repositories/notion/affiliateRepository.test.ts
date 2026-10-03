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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);

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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);
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
      const sut = new NotionAffiliateRepository(mockClient as never);
      const ids = [
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
      ];

      await expect(sut.findByIds(ids)).rejects.toThrow(ExternalSourceError);
    });

    it('starts every page fetch before any page fetch resolves', async () => {
      const mockClient = createMockNotionClient();
      const requestedIds: string[] = [];
      const pendingPages = new Map<
        string,
        (page: ReturnType<typeof createNotionAffiliatePageResponse>) => void
      >();
      mockClient.pages.retrieve.mockImplementation(
        ({ page_id }) =>
          new Promise((resolve) => {
            requestedIds.push(page_id);
            pendingPages.set(page_id, resolve);
          })
      );
      const sut = new NotionAffiliateRepository(mockClient as never);
      const ids = [
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
        AffiliateId.reconstitute('550e8400-e29b-41d4-a716-446655440002'),
      ];

      const resultPromise = sut.findByIds(ids);

      expect(requestedIds).toEqual(ids.map((id) => id.getValue()));
      for (const id of requestedIds) {
        pendingPages.get(id)?.(
          createNotionAffiliatePageResponse({ type: 'AFFILIATE_BANNER', id })
        );
      }
      await expect(resultPromise).resolves.toHaveProperty('size', 2);
    });
  });
});
