import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { ListedCategory } from '../../app/siteMetadata';
import { fetchPostSummariesByCategory } from '../../infrastructure/cache/posts';
import { postLogger } from '../../modules/post/adapters/shared/logger';
import { UseCaseError } from '../../modules/post/use-cases/shared';
import { Articles } from './Articles';
import { ArticlesSkeleton } from './ArticlesSkeleton';

interface Props {
  category: ListedCategory;
  searchParams: Promise<{ page?: string }>;
}

// Query parameters are read after the category shell has rendered.
export async function CategoryArticles({
  category: listedCategory,
  searchParams,
}: Props) {
  const { page = '1' } = await searchParams;
  const currentPage = Number(page);

  async function fetchArticles() {
    return fetchPostSummariesByCategory({
      category: listedCategory,
      page: currentPage,
      pageSize: 6,
    }).catch((error) => {
      if (error instanceof UseCaseError) {
        postLogger.warn(
          { err: error, category: listedCategory, page: currentPage },
          'Invalid category page request'
        );
      } else {
        postLogger.error(
          { err: error, category: listedCategory, page: currentPage },
          'Failed to fetch post summaries by category'
        );
      }
      notFound();
    });
  }

  return (
    <Suspense key={currentPage} fallback={<ArticlesSkeleton />}>
      <Articles fetchArticles={fetchArticles} />
    </Suspense>
  );
}
