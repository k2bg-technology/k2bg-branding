import { describe, expect, it, vi } from 'vitest';
import type { FetchAllSlugsQueryService, SlugRecord } from './queryService';
import { FetchAllSlugs } from './useCase';

describe('FetchAllSlugs', () => {
  const createMockQueryService = (
    overrides: Partial<FetchAllSlugsQueryService> = {}
  ): FetchAllSlugsQueryService => ({
    fetchAllSlugs: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

  const createSlugRecords = (count: number): SlugRecord[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `550e8400-e29b-41d4-a716-44665544000${i}`,
      slug: `test-post-${i}`,
    }));

  describe('execute', () => {
    it('returns all slugs', async () => {
      const slugRecords = createSlugRecords(5);
      const queryService = createMockQueryService({
        fetchAllSlugs: vi.fn().mockResolvedValue(slugRecords),
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute();

      expect(result.slugs).toHaveLength(5);
      expect(result.slugs[0]).toEqual({
        id: slugRecords[0].id,
        slug: slugRecords[0].slug,
      });
    });

    it('uses default order when not specified', async () => {
      const fetchAllSlugs = vi.fn().mockResolvedValue([]);
      const queryService = createMockQueryService({ fetchAllSlugs });
      const sut = new FetchAllSlugs(queryService);

      await sut.execute();

      expect(fetchAllSlugs).toHaveBeenCalledWith({ orderBy: 'desc' });
    });

    it('passes orderBy to query service', async () => {
      const fetchAllSlugs = vi.fn().mockResolvedValue([]);
      const queryService = createMockQueryService({ fetchAllSlugs });
      const sut = new FetchAllSlugs(queryService);

      await sut.execute({ orderBy: 'asc' });

      expect(fetchAllSlugs).toHaveBeenCalledWith({ orderBy: 'asc' });
    });

    it('returns empty array when no posts exist', async () => {
      const queryService = createMockQueryService({
        fetchAllSlugs: vi.fn().mockResolvedValue([]),
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute();

      expect(result.slugs).toEqual([]);
    });

    it('maps slug records to SlugOutput', async () => {
      const slugRecords: SlugRecord[] = [
        { id: 'id-1', slug: 'first-post' },
        { id: 'id-2', slug: 'second-post' },
      ];
      const queryService = createMockQueryService({
        fetchAllSlugs: vi.fn().mockResolvedValue(slugRecords),
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute();

      expect(result.slugs).toEqual([
        { id: 'id-1', slug: 'first-post' },
        { id: 'id-2', slug: 'second-post' },
      ]);
    });
  });
});
