import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArticlesSkeleton } from '../../../components/articles/ArticlesSkeleton';
import { CategoryArticles } from '../../../components/articles/CategoryArticles';
import { PageLayout } from '../../../components/page-layout';
import { ScrollToTopButton } from '../../../components/scroll-to-top-button/ScrollToTopButton';
import { getDefaultOgImageUrl } from '../../../infrastructure/di';
import { getCategoryDisplayName } from '../../../modules/post/domain';
import {
  BLOG_CATEGORY_DESCRIPTIONS,
  BLOG_SITE_NAME,
  isListedCategory,
  LISTED_CATEGORIES,
  type ListedCategory,
} from '../../siteMetadata';

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{
  page?: string;
}>;

interface Props {
  params: Params;
  searchParams: SearchParams;
}

export interface CategoryStaticParameter {
  category: ListedCategory;
}

export async function generateStaticParams(): Promise<
  CategoryStaticParameter[]
> {
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
      <Suspense fallback={<ArticlesSkeleton />}>
        <CategoryArticles
          category={listedCategory}
          searchParams={searchParams}
        />
      </Suspense>
    </PageLayout>
  );
}
