import { APIResponseError } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';

import { Media, MediaId, MediaType } from '../../../../domain';
import {
  createNotionMediaPageResponse,
  ExternalSourceError,
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
      const sut = new NotionMediaRepository(mockClient as never);
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
      const sut = new NotionMediaRepository(mockClient as never);
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
      const sut = new NotionMediaRepository(mockClient as never);
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
      const sut = new NotionMediaRepository(mockClient as never);
      const mediaId = MediaId.reconstitute(
        '550e8400-e29b-41d4-a716-446655440001'
      );

      const result = await sut.findById(mediaId);

      expect(result).toBeNull();
    });
  });
});
