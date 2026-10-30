import { cacheLife } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepositoryError } from '../../modules/post/adapters/shared/errors';
import {
  InvalidPaginationError,
  PostNotFoundError,
  UseCaseError,
} from '../../modules/post/use-cases/shared';
import {
  fetchAllSlugs,
  fetchPost,
  fetchPostSummariesByCategory,
} from './posts';

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock('../di', () => ({
  createFetchAllSlugsUseCase: () => ({ execute }),
  createFetchPostUseCase: () => ({ execute }),
  createFetchPostSummariesByCategoryUseCase: () => ({ execute }),
}));
vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('react', () => ({ cache: <Output>(callback: Output) => callback }));

describe('cached post reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      scenario: 'missing article',
      error: new PostNotFoundError('missing-post'),
      read: () => fetchPost('missing-post'),
    },
    {
      scenario: 'invalid category pagination',
      error: new InvalidPaginationError('page must be positive'),
      read: () =>
        fetchPostSummariesByCategory({
          category: 'ENGINEERING',
          page: 0,
          pageSize: 6,
        }),
    },
  ])(
    'preserves application-error classification for $scenario',
    async ({ error, read }) => {
      execute.mockRejectedValue(error);

      const result = read();

      await expect(result).rejects.toBeInstanceOf(UseCaseError);
      await expect(result).rejects.toThrow(error.message);
    }
  );

  it('retains the infrastructure cause without classifying an outage as an application failure', async () => {
    const failure = new RepositoryError(
      'Post read failed',
      new Error('Connection refused')
    );
    execute.mockRejectedValue(failure);

    const result = fetchPost('post');

    await expect(result).rejects.not.toBeInstanceOf(UseCaseError);
    await expect(result).rejects.toMatchObject({
      name: 'RepositoryError',
      message: 'Post read failed',
      stack: failure.stack,
      cause: { name: 'Error', message: 'Connection refused' },
    });
  });
});

describe.each([
  {
    scenario: 'article',
    read: () => fetchPost('post'),
    data: { post: { slug: 'post' } },
  },
  {
    scenario: 'category summaries',
    read: () =>
      fetchPostSummariesByCategory({
        category: 'ENGINEERING',
        page: 1,
        pageSize: 6,
      }),
    data: { posts: [], total: 0 },
  },
  { scenario: 'all slugs', read: () => fetchAllSlugs(), data: { slugs: [] } },
])('$scenario cache lifetime', ({ read, data }) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses a short cache lifetime and never hours when the dependency fails', async () => {
    execute.mockRejectedValue(new Error('Source unavailable'));
    const sut = read;

    await expect(sut()).rejects.toThrow('Source unavailable');

    expect(cacheLife).toHaveBeenCalledWith(
      expect.objectContaining({ revalidate: 60, expire: 300 })
    );
    expect(cacheLife).not.toHaveBeenCalledWith('hours');
  });

  it('uses hours when the dependency succeeds', async () => {
    execute.mockResolvedValue(data);
    const sut = read;

    await sut();

    expect(cacheLife).toHaveBeenCalledWith('hours');
  });
});
