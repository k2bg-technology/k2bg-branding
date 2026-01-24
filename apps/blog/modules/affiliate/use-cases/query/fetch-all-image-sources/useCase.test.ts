import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createImageSource,
  createImageSources,
  resetFactoryCounter,
} from '../../shared/testing/factories';
import type { FetchAllImageSourcesQueryService } from './queryService';
import { FetchAllImageSources } from './useCase';

describe('FetchAllImageSources', () => {
  beforeEach(() => {
    resetFactoryCounter();
  });

  const createMockQueryService = (
    overrides: Partial<FetchAllImageSourcesQueryService> = {}
  ): FetchAllImageSourcesQueryService => ({
    fetchAllImageSources: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

  describe('execute', () => {
    it('returns empty array when no image sources exist', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchAllImageSources(queryService);

      const result = await sut.execute();

      expect(result).toEqual([]);
    });

    it('returns mapped image sources', async () => {
      const imageSources = createImageSources(3);
      const queryService = createMockQueryService({
        fetchAllImageSources: vi.fn().mockResolvedValue(imageSources),
      });
      const sut = new FetchAllImageSources(queryService);

      const result = await sut.execute();

      expect(result).toHaveLength(3);
    });

    it('maps ImageSource to ImageSourceOutput correctly', async () => {
      const imageSource = createImageSource();
      const queryService = createMockQueryService({
        fetchAllImageSources: vi.fn().mockResolvedValue([imageSource]),
      });
      const sut = new FetchAllImageSources(queryService);

      const result = await sut.execute();

      expect(result[0].id).toBe(imageSource.id.getValue());
      expect(result[0].url).toBe(imageSource.url.getValue());
    });

    it('calls query service once', async () => {
      const fetchAllImageSources = vi.fn().mockResolvedValue([]);
      const queryService = createMockQueryService({ fetchAllImageSources });
      const sut = new FetchAllImageSources(queryService);

      await sut.execute();

      expect(fetchAllImageSources).toHaveBeenCalledTimes(1);
    });

    it('preserves order of image sources', async () => {
      const imageSources = createImageSources(3);
      const queryService = createMockQueryService({
        fetchAllImageSources: vi.fn().mockResolvedValue(imageSources),
      });
      const sut = new FetchAllImageSources(queryService);

      const result = await sut.execute();

      expect(result[0].id).toBe(imageSources[0].id.getValue());
      expect(result[1].id).toBe(imageSources[1].id.getValue());
      expect(result[2].id).toBe(imageSources[2].id.getValue());
    });
  });
});
