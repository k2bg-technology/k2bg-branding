import { Suspense } from 'react';

import * as Prisma from '../../modules/data-access/prisma';
import { Articles } from '../../components/articles/Articles';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';

const PAGE_SIZE = 6;

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    query?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const postRepository = new Prisma.PostRepository();

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize py-4">
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
