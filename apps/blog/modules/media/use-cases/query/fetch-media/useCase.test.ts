import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  InvalidMediaIdError,
  type MediaRepository,
  SourceUrl,
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
    findAllImageSources: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

  describe('execute', () => {
    it('returns media when found', async () => {
      const media = createMedia();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(media),
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({ id: media.id.getValue() });

      expect(result.media.id).toBe(media.id.getValue());
      expect(result.media.name).toBe(media.name.getValue());
      expect(result.media.type).toBe(media.type);
    });

    it('throws MediaNotFoundError when media does not exist', async () => {
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchMedia(repository);

      await expect(
        sut.execute({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toThrow(MediaNotFoundError);
    });

    it('throws MediaNotFoundError with correct identifier', async () => {
      const testId = '550e8400-e29b-41d4-a716-446655440000';
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchMedia(repository);

      await expect(sut.execute({ id: testId })).rejects.toThrow(
        `Media not found: ${testId}`
      );
    });

    it('throws InvalidMediaIdError when provided invalid UUID format', async () => {
      const repository = createMockRepository();
      const sut = new FetchMedia(repository);

      await expect(sut.execute({ id: 'invalid-uuid' })).rejects.toThrow(
        InvalidMediaIdError
      );
    });

    it('calls repository with correct MediaId', async () => {
      const media = createMedia();
      const findById = vi.fn().mockResolvedValue(media);
      const repository = createMockRepository({ findById });
      const sut = new FetchMedia(repository);

      await sut.execute({ id: media.id.getValue() });

      expect(findById).toHaveBeenCalledTimes(1);
      const calledMediaId = findById.mock.calls[0][0];
      expect(calledMediaId.getValue()).toBe(media.id.getValue());
    });

    it('maps all media properties correctly', async () => {
      const media = createMedia();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(media),
      });
      const sut = new FetchMedia(repository);

      const result = await sut.execute({ id: media.id.getValue() });

      expect(result.media).toEqual({
        id: media.id.getValue(),
        name: media.name.getValue(),
        type: media.type,
        sourceFile: media.sourceFile?.getValue() ?? null,
        sourceUrl: media.sourceUrl?.getValue() ?? null,
        targetUrl: media.targetUrl?.getValue() ?? null,
        width: media.width?.getValue() ?? null,
        height: media.height?.getValue() ?? null,
        extension: media.extension?.getValue() ?? null,
        effectiveSource: media.getEffectiveSource(),
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
