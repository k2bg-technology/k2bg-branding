import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Articles } from '../../../components/articles/Articles';
import { ArticlesSkeleton } from '../../../components/articles/ArticlesSkeleton';
import { PageLayout } from '../../../components/page-layout';
import { ScrollToTopButton } from '../../../components/scroll-to-top-button/ScrollToTopButton';
import {
  createFetchPostSummariesByCategoryUseCase,
  getDefaultOgImageUrl,
} from '../../../infrastructure/di';
import { postLogger } from '../../../modules/post/adapters/shared/logger';
import { getCategoryDisplayName } from '../../../modules/post/domain';
import { UseCaseError } from '../../../modules/post/use-cases/shared';
import {
  BLOG_CATEGORY_DESCRIPTIONS,
  BLOG_SITE_NAME,
  isListedCategory,
  LISTED_CATEGORIES,
} from '../../siteMetadata';

const PAGE_SIZE = 6;

export const revalidate = 3600;

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{
  page?: string;
}>;

interface Props {
  params: Params;
  searchParams: SearchParams;
}

export async function generateStaticParams() {
  return LISTED_CATEGORIES.map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isListedCategory(category)) {
    notFound();
  }

  const ogImageUrl = getDefaultOgImageUrl();
  const displayName = getCategoryDisplayName(category);
  const description = BLOG_CATEGORY_DESCRIPTIONS[category];

  return {
    title: displayName,
    description,
    alternates: {
      canonical: `/category/${category}`,
    },
    openGraph: {
      title: displayName,
      description,
      type: 'website',
      locale: 'ja_JP',
      siteName: BLOG_SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayName,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;
  if (!isListedCategory(category)) {
    notFound();
  }
  const listedCategory = category;

  const { page = '1' } = await searchParams;
  const currentPage = Number(page);

  const fetchPostSummariesByCategory =
    createFetchPostSummariesByCategoryUseCase();

  async function fetchArticles() {
    return fetchPostSummariesByCategory
      .execute({
        category: listedCategory,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      .catch((error) => {
        if (error instanceof UseCaseError) {
          postLogger.warn(
            { err: error, category: listedCategory, page: currentPage },
            'Invalid category page request'
          );
        } else {
          postLogger.error(
            { err: error, category: listedCategory, page: currentPage },
            'Failed to fetch post summaries by category'
          );
        }
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
      <h1 className="col-span-full text-heading-1 font-bold">
        {getCategoryDisplayName(listedCategory)}
      </h1>
      <Suspense key={currentPage} fallback={<ArticlesSkeleton />}>
        <Articles fetchArticles={fetchArticles} />
      </Suspense>
    </PageLayout>
  );
}
