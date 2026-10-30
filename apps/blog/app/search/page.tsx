import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArticlesSkeleton } from '../../components/articles/ArticlesSkeleton';
import { SearchArticles } from '../../components/articles/SearchArticles';
import { PageLayout } from '../../components/page-layout';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';

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
  return (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
      <Suspense fallback={<ArticlesSkeleton />}>
        <SearchArticles searchParams={searchParams} />
      </Suspense>
    </PageLayout>
  );
}
