import { Suspense } from 'react';

import Pagination from '../../../components/pagination/Pagination';
import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';
import { Category } from '../../../modules/domain/post/types';
import * as Prisma from '../../../modules/data-access/prisma';

const PAGE_SIZE = 6;

export async function generateStaticParams() {
  return ['engineering', 'design', 'data-science', 'life-style'].map(
    (category) => ({
      category,
    })
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams?: {
    page?: string;
  };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const category = ((pramCategory) => {
    switch (pramCategory) {
      case 'engineering':
        return Category.ENGINEERING;
      case 'design':
        return Category.DESIGN;
      case 'data-science':
        return Category.DATA_SCIENCE;
      case 'life-style':
        return Category.LIFE_STYLE;
      default:
        return Category.OTHER;
    }
  })(params.category);

  const postRepository = new Prisma.PostRepository();
  const totalPageCount = Math.ceil(
    (await postRepository.getArticlesCountByCategory(category)) / PAGE_SIZE
  );

  return (
    <>
      <h1 className="col-span-full text-header-1 font-bold capitalize">
        {params.category}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
        <div className="grid grid-cols-[subgrid] col-span-full">
          <Articles
            fetchArticles={() =>
              postRepository.getPaginatedArticlesByCategory(
                category,
                PAGE_SIZE,
                currentPage
              )
            }
          />
        </div>
        <div className="flex justify-center grid-cols-[subgrid] col-span-full">
          <Pagination count={totalPageCount} />
        </div>
      </Suspense>
    </>
  );
}
