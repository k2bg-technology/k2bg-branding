import { describe, expect, it, vi } from 'vitest';
import { SyncError } from '../../shared';
import type {
  ExternalImageSource,
  ImageSourceRecord,
} from './externalImageSource';
import type { ImageRepository } from './imageRepository';
import { SyncHeroImages } from './useCase';

describe('SyncHeroImages', () => {
  const createMockImageSource = (
    images: ImageSourceRecord[] = []
  ): ExternalImageSource => ({
    fetchImageSources: vi.fn().mockResolvedValue(images),
  });

  const createMockImageRepository = (
    overrides: Partial<ImageRepository> = {}
  ): ImageRepository => ({
    uploadImage: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const createImageRecords = (count: number): ImageSourceRecord[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `image-${i}`,
      url: `https://example.com/image-${i}.jpg`,
    }));

  describe('execute', () => {
    it('collects and uploads images from all sources', async () => {
      const source1 = createMockImageSource(createImageRecords(2));
      const source2 = createMockImageSource(createImageRecords(3));
      const imageRepository = createMockImageRepository();
      const sut = new SyncHeroImages([source1, source2], imageRepository);

      const result = await sut.execute();

      expect(result.count).toBe(5);
      expect(result.uploadedImages).toHaveLength(5);
    });

    it('calls uploadImage for each image', async () => {
      const images = createImageRecords(2);
      const source = createMockImageSource(images);
      const uploadImage = vi.fn().mockResolvedValue(undefined);
      const imageRepository = createMockImageRepository({ uploadImage });
      const sut = new SyncHeroImages([source], imageRepository);

      await sut.execute();

      expect(uploadImage).toHaveBeenCalledTimes(2);
      expect(uploadImage).toHaveBeenCalledWith(images[0].id, images[0].url);
      expect(uploadImage).toHaveBeenCalledWith(images[1].id, images[1].url);
    });

    it('handles empty sources', async () => {
      const source = createMockImageSource([]);
      const imageRepository = createMockImageRepository();
      const sut = new SyncHeroImages([source], imageRepository);

      const result = await sut.execute();

      expect(result.count).toBe(0);
      expect(result.uploadedImages).toEqual([]);
    });

    it('continues on individual upload failures', async () => {
      const images = createImageRecords(3);
      const source = createMockImageSource(images);
      const uploadImage = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce(undefined);
      const imageRepository = createMockImageRepository({ uploadImage });
      const sut = new SyncHeroImages([source], imageRepository);

      const result = await sut.execute();

      expect(result.count).toBe(2);
      expect(result.failedCount).toBe(1);
    });

    it('throws SyncError when source fails', async () => {
      const source: ExternalImageSource = {
        fetchImageSources: vi.fn().mockRejectedValue(new Error('Source error')),
      };
      const imageRepository = createMockImageRepository();
      const sut = new SyncHeroImages([source], imageRepository);

      await expect(sut.execute()).rejects.toThrow(SyncError);
      await expect(sut.execute()).rejects.toThrow('Source error');
    });

    it('works with multiple sources with different image counts', async () => {
      const source1 = createMockImageSource([
        { id: 'post-1', url: 'https://example.com/post-1.jpg' },
      ]);
      const source2 = createMockImageSource([
        { id: 'media-1', url: 'https://example.com/media-1.jpg' },
        { id: 'media-2', url: 'https://example.com/media-2.jpg' },
      ]);
      const source3 = createMockImageSource([]);
      const imageRepository = createMockImageRepository();
      const sut = new SyncHeroImages(
        [source1, source2, source3],
        imageRepository
      );

      const result = await sut.execute();

      expect(result.count).toBe(3);
    });

    it('reports all failures when all uploads fail', async () => {
      const images = createImageRecords(2);
      const source = createMockImageSource(images);
      const uploadImage = vi.fn().mockRejectedValue(new Error('Upload failed'));
      const imageRepository = createMockImageRepository({ uploadImage });
      const sut = new SyncHeroImages([source], imageRepository);

      const result = await sut.execute();

      expect(result.count).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(result.uploadedImages).toEqual([]);
    });
  });
});
