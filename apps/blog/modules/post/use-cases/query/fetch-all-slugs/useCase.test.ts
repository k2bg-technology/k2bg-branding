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

  describe('execute', () => {
    it('selects descending slugs by default', async () => {
      const queryService = createMockQueryService({
        fetchAllSlugs: async ({ orderBy }) =>
          orderBy === 'desc'
            ? [
                {
                  id: 'descending-id',
                  slug: 'descending',
                  revisionDate: '2024-01-02',
                },
              ]
            : [
                {
                  id: 'ascending-id',
                  slug: 'ascending',
                  revisionDate: '2024-01-01',
                },
              ],
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute();

      expect(result.slugs.map((slug) => slug.id)).toEqual(['descending-id']);
    });

    it('selects ascending slugs when requested', async () => {
      const queryService = createMockQueryService({
        fetchAllSlugs: async ({ orderBy }) =>
          orderBy === 'asc'
            ? [
                {
                  id: 'ascending-id',
                  slug: 'ascending',
                  revisionDate: '2024-01-01',
                },
              ]
            : [
                {
                  id: 'descending-id',
                  slug: 'descending',
                  revisionDate: '2024-01-02',
                },
              ],
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute({ orderBy: 'asc' });

      expect(result.slugs.map((slug) => slug.id)).toEqual(['ascending-id']);
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
        {
          id: 'id-1',
          slug: 'first-post',
          revisionDate: '2024-01-15',
        },
        {
          id: 'id-2',
          slug: 'second-post',
          revisionDate: '2024-02-20',
        },
      ];
      const queryService = createMockQueryService({
        fetchAllSlugs: vi.fn().mockResolvedValue(slugRecords),
      });
      const sut = new FetchAllSlugs(queryService);

      const result = await sut.execute();

      expect(result.slugs).toEqual([
        {
          id: 'id-1',
          slug: 'first-post',
          revisionDate: '2024-01-15',
        },
        {
          id: 'id-2',
          slug: 'second-post',
          revisionDate: '2024-02-20',
        },
      ]);
    });
  });
});
