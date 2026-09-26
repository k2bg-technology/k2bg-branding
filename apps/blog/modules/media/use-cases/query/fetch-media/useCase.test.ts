import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Extension,
  Height,
  InvalidMediaIdError,
  MediaId,
  MediaName,
  type MediaRepository,
  MediaType,
  SourceUrl,
  TargetUrl,
  Width,
} from '../../../domain';
import { MediaNotFoundError } from '../../shared';
import {
  createMedia,
  createMediaWithFile,
  resetFactoryCounter,
} from '../../shared/testing/factories';
import { FetchMedia } from './useCase';

describe('FetchMedia', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  const createMockRepository = (
    overrides: Partial<MediaRepository> = {}
  ): MediaRepository => ({
    findById: vi.fn().mockResolvedValue(null),
    ...overrides,
  });

  describe('execute', () => {
    it('throws MediaNotFoundError when media does not exist', async () => {
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchMedia(repository);

      await expect(
        sut.execute({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toThrow(MediaNotFoundError);
    });

    it('throws InvalidMediaIdError when provided invalid UUID format', async () => {
      const repository = createMockRepository();
      const sut = new FetchMedia(repository);

      await expect(sut.execute({ id: 'invalid-uuid' })).rejects.toThrow(
        InvalidMediaIdError
      );
    });

    it('returns the selected media properties as plain values', async () => {
      const media = createMedia({
        id: MediaId.reconstitute('550e8400-e29b-41d4-a716-446655440001'),
        name: MediaName.reconstitute('Cover photo'),
        type: MediaType.IMAGE,
        sourceFile: null,
        sourceUrl: SourceUrl.reconstitute('https://example.com/cover.jpg'),
        targetUrl: TargetUrl.reconstitute('https://example.com/article'),
        width: Width.reconstitute(1200),
        height: Height.reconstitute(800),
        extension: Extension.reconstitute('jpg'),
      });
      const repository = createMockRepository({
        findById: async (id) =>
          id.getValue() === '550e8400-e29b-41d4-a716-446655440001'
            ? media
            : null,
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      expect(result.media).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Cover photo',
        type: MediaType.IMAGE,
        sourceFile: null,
        sourceUrl: 'https://example.com/cover.jpg',
        targetUrl: 'https://example.com/article',
        width: 1200,
        height: 800,
        extension: 'jpg',
        effectiveSource: 'https://example.com/cover.jpg',
      });
    });

    it('returns effectiveSource as sourceFile when both exist', async () => {
      const media = createMediaWithFile({
        sourceUrl: SourceUrl.reconstitute('https://example.com/fallback.jpg'),
      });
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(media),
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({ id: media.id.getValue() });

      expect(result.media.effectiveSource).toBe(media.sourceFile?.getValue());
      expect(result.media.effectiveSource).not.toBe(
        media.sourceUrl?.getValue()
      );
    });

    it('returns effectiveSource as sourceUrl when sourceFile is null', async () => {
      const media = createMedia();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(media),
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({ id: media.id.getValue() });

      expect(result.media.effectiveSource).toBe(media.sourceUrl?.getValue());
    });

    it('handles media with null optional properties', async () => {
      const media = createMedia({
        targetUrl: null,
        width: null,
        height: null,
        extension: null,
      });
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(media),
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({ id: media.id.getValue() });

      expect(result.media.targetUrl).toBeNull();
      expect(result.media.width).toBeNull();
      expect(result.media.height).toBeNull();
      expect(result.media.extension).toBeNull();
    });
  });
});
