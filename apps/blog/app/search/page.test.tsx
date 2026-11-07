/** @vitest-environment node */
import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SearchPostSummaries } from '../../modules/post/use-cases/query/search-post-summaries/useCase';
import { createPostSummaryOutput } from '../../modules/post/use-cases/shared/testing/factories';

import Page from './page';

const { createSearchUseCase } = vi.hoisted(() => ({
  createSearchUseCase: vi.fn(),
}));

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/search',
}));

vi.mock('../../infrastructure/di', () => ({
  createSearchPostSummariesUseCase: createSearchUseCase,
}));

async function renderPage(
  searchParameters: Awaited<PageProps<'/search'>['searchParams']>
) {
  const errors: unknown[] = [];
  const page = await Page({
    params: Promise.resolve({}),
    searchParams: Promise.resolve(searchParameters),
  });
  const stream = await renderToReadableStream(page, {
    onError: (error) => {
      errors.push(error);
    },
  });
  await stream.allReady;
  const markup = await new Response(stream).text();

  return { markup, errors };
}

describe('search page', () => {
  it.each([
    {
      name: 'the default empty query and first page',
      searchParameters: {},
      query: '',
      page: 1,
    },
    {
      name: 'the requested query and page',
      searchParameters: { query: 'typescript', page: '2' },
      query: 'typescript',
      page: 2,
    },
  ])('renders results for $name', async ({ searchParameters, query, page }) => {
    const post = createPostSummaryOutput({
      title: 'Selected search result',
      imageUrl: '',
      author: null,
    });
    const sut = new SearchPostSummaries({
      searchPostSummaries: async (input) =>
        input.query === query && input.page === page && input.pageSize === 6
          ? { posts: [post], totalCount: 1 }
          : { posts: [], totalCount: 0 },
    });
    createSearchUseCase.mockReturnValue(sut);

    const result = await renderPage(searchParameters);

    expect(result.markup).toContain('Selected search result');
    expect(result.errors).toEqual([]);
  });

  it('keeps repeated queries inside the streamed not-found boundary', async () => {
    createSearchUseCase.mockReturnValue(
      new SearchPostSummaries({
        searchPostSummaries: async () => ({ posts: [], totalCount: 0 }),
      })
    );

    const result = await renderPage({ query: ['typescript', 'react'] });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        digest: 'NEXT_HTTP_ERROR_FALLBACK;404',
      })
    );
  });
});
