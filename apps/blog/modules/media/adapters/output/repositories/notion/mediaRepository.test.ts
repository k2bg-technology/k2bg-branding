import { APIResponseError } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';

import { Media, MediaId, MediaType } from '../../../../domain';
import {
  createNotionMediaPageResponse,
  ExternalSourceError,
  NOTION_MEDIA_TYPES,
} from '../../../shared';

import { NotionMediaRepository } from './mediaRepository';

describe('NotionMediaRepository', () => {
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
      const page = createNotionMediaPageResponse({
        type: 'MEDIA_IMAGE',
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Media',
        sourceUrl: 'https://example.com/image.jpg',
      });
      mockClient.pages.retrieve.mockResolvedValue(page);
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');
      const mediaId = MediaId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(mediaId);

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Media);
      expect(result?.type).toBe(MediaType.IMAGE);
      expect(result?.name.getValue()).toBe('Test Media');
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
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');
      const mediaId = MediaId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(mediaId);

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
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');
      const mediaId = MediaId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      await expect(sut.findById(mediaId)).rejects.toThrow(ExternalSourceError);
    });

    it('returns null when page has no properties', async () => {
      const mockClient = createMockNotionClient();
      mockClient.pages.retrieve.mockResolvedValue({
        object: 'page',
        id: '550e8400-e29b-41d4-a716-446655440001',
      });
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');
      const mediaId = MediaId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(mediaId);

      expect(result).toBeNull();
    });
  });

  describe('findAllImageSources', () => {
    it('filters by MEDIA_IMAGE type', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');

      await sut.findAllImageSources();

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
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');

      const result = await sut.findAllImageSources();

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
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');

      const result = await sut.findAllImageSources();

      expect(result).toHaveLength(1);
      expect(result[0].id.getValue()).toBe(
        '550e8400-e29b-41d4-a716-446655440001'
      );
    });

    it('returns empty array when no results', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockResolvedValue({ results: [] });
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');

      const result = await sut.findAllImageSources();

      expect(result).toEqual([]);
    });

    it('throws ExternalSourceError on API error', async () => {
      const mockClient = createMockNotionClient();
      mockClient.databases.query.mockRejectedValue(new Error('API Error'));
      const sut = new NotionMediaRepository(mockClient as never, 'test-db-id');

      await expect(sut.findAllImageSources()).rejects.toThrow(
        ExternalSourceError
      );
    });
  });
});
