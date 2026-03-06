import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';
import { PageLayout } from '../../../components/page-layout';
import { ScrollToTopButton } from '../../../components/scroll-to-top-button/ScrollToTopButton';
import {
  createFetchPostSummariesByCategoryUseCase,
  getDefaultOgImageUrl,
} from '../../../infrastructure/di';
import { Category } from '../../../modules/post/domain';

const PAGE_SIZE = 6;

export const revalidate = 3600;

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

  const ogImageUrl = getDefaultOgImageUrl();
  const description = `${category} カテゴリの記事一覧`;

  return {
    title: category,
    alternates: {
      canonical: `/category/${category}`,
    },
    openGraph: {
      title: category,
      description,
      type: 'website',
      locale: 'ja_JP',
      siteName: 'K2.B.G Technology Blog',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: category,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;

  const { page = '1' } = await searchParams;
  const currentPage = Number(page);

  const fetchPostSummariesByCategory =
    createFetchPostSummariesByCategoryUseCase();

  async function fetchArticles() {
    return fetchPostSummariesByCategory
      .execute({
        category,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      .catch(() => {
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
      <h1 className="col-span-full text-heading-1 font-bold capitalize">
        {category}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
        <Articles fetchArticles={fetchArticles} />
      </Suspense>
    </PageLayout>
  );
}
