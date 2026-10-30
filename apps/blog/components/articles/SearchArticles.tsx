import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createSearchPostSummariesUseCase } from '../../infrastructure/di';
import { postLogger } from '../../modules/post/adapters/shared/logger';
import { UseCaseError } from '../../modules/post/use-cases/shared';
import { Articles } from './Articles';
import { ArticlesSkeleton } from './ArticlesSkeleton';

interface Props {
  searchParams: Promise<{ page?: string; query?: string }>;
}

// Search stays request-bound while the surrounding page layout prerenders.
export async function SearchArticles({ searchParams }: Props) {
  const { query = '', page = '1' } = await searchParams;
  const currentPage = Number(page);

  const searchPostSummaries = createSearchPostSummariesUseCase();

  async function fetchArticles() {
    return searchPostSummaries
      .execute({
        query,
        page: currentPage,
        pageSize: 6,
      })
      .catch((error) => {
        if (error instanceof UseCaseError) {
          postLogger.warn(
            { err: error, page: currentPage },
            'Invalid search request'
          );
        } else {
          postLogger.error(
            { err: error, page: currentPage },
            'Failed to search post summaries'
          );
        }
        notFound();
      });
  }

  return (
    <>
      <h1 className="col-span-full text-heading-1 font-bold capitalize py-4">
        {query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkeleton />}>
        <Articles fetchArticles={fetchArticles} />
      </Suspense>
    </>
  );
}
