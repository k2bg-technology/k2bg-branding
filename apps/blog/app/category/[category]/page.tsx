import { Suspense } from 'react';

import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';
import { Category } from '../../../modules/domain/post/types';
import * as Prisma from '../../../modules/data-access/prisma';

const PAGE_SIZE = 6;

export async function generateStaticParams() {
  return [
    Category.ENGINEERING,
    Category.DESIGN,
    Category.DATA_SCIENCE,
    Category.LIFE_STYLE,
    Category.OTHER,
  ].map((category) => ({
    category,
  }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { category: Category };
  searchParams?: {
    page?: string;
  };
}) {
  const currentPage = Number(searchParams?.page) || 1;

  const postRepository = new Prisma.Post.Repository();

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize">
        {params.category}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
        <Articles
          fetchArticles={() =>
            postRepository.getPaginatedArticlesByCategory(
              params.category,
              PAGE_SIZE,
              currentPage
            )
          }
          fetchArticlesCount={async () =>
            Math.ceil(
              (await postRepository.getArticlesCountByCategory(
                params.category
              )) / PAGE_SIZE
            )
          }
        />
      </Suspense>
    </>
  );
}
