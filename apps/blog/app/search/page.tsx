import { Suspense } from 'react';

import * as Prisma from '../../modules/data-access/prisma';
import Pagination from '../../components/pagination/Pagination';
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
  const totalPageCount = Math.ceil(
    (await postRepository.getArticlesCountByQueryString(query)) / PAGE_SIZE
  );

  const showArticles = totalPageCount > 0;

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize py-4">
        {query}
      </h1>
      <Suspense key={`${currentPage}-${query}`} fallback={<ArticlesSkelton />}>
        <div className="grid grid-cols-[subgrid] col-span-full">
          {showArticles ? (
            <Articles
              fetchArticles={() =>
                postRepository.getPaginatedArticlesByQueryString(
                  query,
                  PAGE_SIZE,
                  currentPage
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 col-span-full">
              検索キーワードに一致する記事は見つかりませんでした。
            </div>
          )}
        </div>
        {showArticles && (
          <div className="flex justify-center grid-cols-[subgrid] col-span-full">
            <Pagination count={totalPageCount} />
          </div>
        )}
      </Suspense>
    </>
  );
}
