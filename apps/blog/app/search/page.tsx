import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Articles } from '../../components/articles/Articles';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';
import { createSearchPostsUseCase } from '../../infrastructure/di';

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

  const searchPosts = createSearchPostsUseCase();

  async function fetchArticles() {
    return searchPosts
      .execute({
        query,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      .catch(() => {
        notFound();
      });
  }

  return (
    <>
      <h1 className="col-span-full text-heading-1 font-bold capitalize py-4">
        {query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkelton />}>
        <Articles fetchArticles={fetchArticles} />
      </Suspense>
    </>
  );
}
