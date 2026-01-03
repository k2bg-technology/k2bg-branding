import { Suspense } from 'react';
import { Metadata } from 'next';

import * as Prisma from '../../modules/data-access/prisma';
import { Articles } from '../../components/articles/Articles';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';

const PAGE_SIZE = 6;

type SearchParams = Promise<{
  page?: string;
  query?: string;
}>;

export const metadata: Metadata = {
  title: '検索ページ',
  alternates: {
    canonical: '/search',
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { query = '', page = '1' } = await searchParams;
  const currentPage = Number(page);

  const postRepository = new Prisma.Post.Repository();

  return (
    <>
      <h1 className="col-span-full text-heading-1 font-bold capitalize py-4">
        {query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkelton />}>
        <Articles
          fetchArticles={async () =>
            postRepository.getPaginatedArticlesByQueryString(
              query,
              PAGE_SIZE,
              currentPage
            )
          }
          fetchArticlesCount={async () =>
            Math.ceil(
              (await postRepository.getArticlesCountByQueryString(query)) /
                PAGE_SIZE
            )
          }
        />
      </Suspense>
    </>
  );
}
