import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';
import * as Prisma from '../../../modules/data-access/prisma';
import { Category } from '../../../modules/domain/post/types';

const PAGE_SIZE = 6;

type Params = Promise<{ category: Category }>;
type SearchParams = Promise<{
  page?: string;
}>;

interface Props {
  params: Params;
  searchParams: SearchParams;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;

  return {
    title: category,
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;

  const { page = '1' } = await searchParams;
  const currentPage = Number(page);

  const postRepository = new Prisma.Post.Repository();

  return (
    <>
      <h1 className="col-span-full text-heading-1 font-bold capitalize">
        {category}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
        <Articles
          fetchArticles={() =>
            postRepository.getPaginatedArticlesByCategory(
              category,
              PAGE_SIZE,
              currentPage
            )
          }
          fetchArticlesCount={async () =>
            Math.ceil(
              (await postRepository.getArticlesCountByCategory(category)) /
                PAGE_SIZE
            )
          }
        />
      </Suspense>
    </>
  );
}
