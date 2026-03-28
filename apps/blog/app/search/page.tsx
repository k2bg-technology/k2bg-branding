import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Articles } from '../../components/articles/Articles';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';
import { PageLayout } from '../../components/page-layout';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';
import { createSearchPostSummariesUseCase } from '../../infrastructure/di';
import { postLogger } from '../../modules/post/adapters/shared/logger';

const PAGE_SIZE = 6;

type SearchParams = Promise<{
  page?: string;
  query?: string;
}>;

export const metadata: Metadata = {
  title: '検索ページ',
  robots: {
    index: false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { query = '', page = '1' } = await searchParams;
  const currentPage = Number(page);

  const searchPostSummaries = createSearchPostSummariesUseCase();

  async function fetchArticles() {
    return searchPostSummaries
      .execute({
        query,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      .catch((error) => {
        postLogger.error(
          { err: error, query, page: currentPage },
          'Failed to search post summaries'
        );
        notFound();
      });
  }

  return (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
      <h1 className="col-span-full text-heading-1 font-bold capitalize py-4">
        {query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkelton />}>
        <Articles fetchArticles={fetchArticles} />
      </Suspense>
    </PageLayout>
  );
}
