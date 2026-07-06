import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Avatar } from 'ui';

import { Articles } from '../../components/articles/Articles';
import { ArticlesSkelton } from '../../components/articles/ArticlesSkelton';
import { BlogCard } from '../../components/blog-card';
import { CloudinaryImage } from '../../components/cloudinary-image/CloudinaryImage';
import { PageLayout } from '../../components/page-layout';
import { Pagination } from '../../components/pagination/Pagination';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';
import { Sidebar } from '../../components/sidebar/Sidebar';
import {
  createFetchPostSummariesUseCase,
  getDefaultOgImageUrl,
} from '../../infrastructure/di';
import { postLogger } from '../../modules/post/adapters/shared/logger';
import { UseCaseError } from '../../modules/post/use-cases/shared';
import {
  buildCanonicalPath,
  buildPaginatedTitle,
  resolvePageParam,
} from '../_lib/pagination';

const PAGE_SIZE = 8;
const BLOG_TITLE = 'K2.B.G Technology Blog';
const BLOG_CANONICAL_PATH = '/blog';

export const revalidate = 3600;

const defaultOgImageUrl = getDefaultOgImageUrl();

const blogDescription =
  'エンジニアでなくてもテクノロジーを活用できる —— そんな情報を発信するブログです。非IT出身からエンジニアへ転身した筆者が、プログラミング・AI・自動化・UI/UXなど幅広いテーマを、わかりやすく解説します。';

type SearchParams = Promise<{
  page?: string;
}>;

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = resolvePageParam(page);

  return {
    title: buildPaginatedTitle(BLOG_TITLE, currentPage),
    description: blogDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: BLOG_TITLE,
      description: blogDescription,
      type: 'website',
      locale: 'ja_JP',
      siteName: BLOG_TITLE,
      images: [{ url: defaultOgImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: BLOG_TITLE,
      description: blogDescription,
      images: [defaultOgImageUrl],
    },
    alternates: {
      canonical: buildCanonicalPath(BLOG_CANONICAL_PATH, currentPage),
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = resolvePageParam(page);

  const fetchPostSummaries = createFetchPostSummariesUseCase();

  const fab = (
    <PageLayout.Fab>
      <ScrollToTopButton />
    </PageLayout.Fab>
  );

  if (currentPage !== 1) {
    const fetchArticles = async () => {
      const result = await fetchPostSummaries
        .execute({ page: currentPage, pageSize: PAGE_SIZE })
        .catch((error) => {
          if (error instanceof UseCaseError) {
            postLogger.warn(
              { err: error, page: currentPage },
              'Invalid blog archive page request'
            );
          } else {
            postLogger.error(
              { err: error, page: currentPage },
              'Failed to fetch post summaries'
            );
          }
          notFound();
        });

      if (result.items.length === 0) {
        notFound();
      }

      return result;
    };

    return (
      <PageLayout fab={fab}>
        <Suspense key={currentPage} fallback={<ArticlesSkelton />}>
          <Articles fetchArticles={fetchArticles} />
        </Suspense>
      </PageLayout>
    );
  }

  const { items: articles, totalPages } = await fetchPostSummaries.execute({
    pageSize: PAGE_SIZE,
  });

  const featureLatest = articles.at(0);
  const featuresRecently = articles.slice(1, 3);
  const featuresPreviously = articles.slice(3, 8);

  return (
    <PageLayout fab={fab}>
      <PageLayout.Row>
        {featureLatest && (
          <div className="col-start-1 col-end-8">
            <BlogCard className="flex-col gap-spacious">
              {featureLatest.imageUrl && (
                <Link
                  href={`/blog/${featureLatest.slug}`}
                  className="peer"
                  data-gtm="article_click_feature_latest_image"
                >
                  <BlogCard.Media className="relative w-full h-[18.75rem]">
                    <CloudinaryImage
                      publicId={featureLatest.id}
                      src={featureLatest.imageUrl}
                      alt="media"
                      className="absolute aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="(max-width: 1280px) calc(100vw - 3rem), 45rem"
                      priority
                      quality={30}
                    />
                  </BlogCard.Media>
                </Link>
              )}
              <BlogCard.Content
                category={
                  <Link
                    href={`/category/${featureLatest.category}`}
                    data-gtm="article_click_feature_latest_category"
                  >
                    {featureLatest.category}
                  </Link>
                }
                heading={
                  <Link
                    href={`/blog/${featureLatest.slug}`}
                    className="heading-link"
                    data-gtm="article_click_feature_latest_heading"
                  >
                    <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                      {featureLatest.title}
                    </h2>
                  </Link>
                }
                excerpt={featureLatest.excerpt ?? undefined}
                avatar={
                  featureLatest.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={featureLatest.author.avatarUrl ?? undefined}
                      />
                    </Avatar>
                  )
                }
                date={featureLatest.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          </div>
        )}
        <div className="col-start-8 col-end-13 hidden xl:grid gap-y-8">
          {featuresRecently.map((article) => (
            <BlogCard key={article.title} className="flex-row gap-spacious">
              {article.imageUrl && (
                <Link
                  href={`/blog/${article.slug}`}
                  className="h-full peer"
                  data-gtm="article_click_feature_recently_image"
                >
                  <BlogCard.Media className="relative flex-none w-[10rem] h-[10rem]">
                    <CloudinaryImage
                      publicId={article.id}
                      alt="media"
                      src={article.imageUrl}
                      className="absolute aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                      fill
                      sizes="10rem"
                      priority
                      quality={30}
                    />
                  </BlogCard.Media>
                </Link>
              )}
              <BlogCard.Content
                category={
                  <Link
                    href={`/category/${article.category}`}
                    data-gtm="article_click_feature_recently_category"
                  >
                    {article.category}
                  </Link>
                }
                heading={
                  <Link
                    href={`/blog/${article.slug}`}
                    className="heading-link"
                    data-gtm="article_click_feature_recently_heading"
                  >
                    <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                }
                excerpt={article.excerpt ?? undefined}
                avatar={
                  article.author && (
                    <Avatar>
                      <Avatar.Image
                        alt="author"
                        src={article.author?.avatarUrl ?? undefined}
                      />
                    </Avatar>
                  )
                }
                date={article.releaseDate}
                className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
              />
            </BlogCard>
          ))}
        </div>
      </PageLayout.Row>
      <PageLayout.Divider />
      <PageLayout.Row>
        <PageLayout.Content colStart={1} colEnd={10}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 place-content-start">
            {featuresRecently.map((article) => (
              <div key={article.title} className="block xl:hidden">
                <BlogCard className="flex-col gap-spacious">
                  {article.imageUrl && (
                    <Link
                      href={`/blog/${article.slug}`}
                      className="h-full peer"
                      data-gtm="article_click_feature_recently_image"
                    >
                      <BlogCard.Media className="relative w-full h-[16rem]">
                        <CloudinaryImage
                          publicId={article.id}
                          src={article.imageUrl}
                          alt="media"
                          className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                          fill
                          sizes="(max-width: 768px) calc(100vw - 3rem), 22rem"
                          quality={30}
                        />
                      </BlogCard.Media>
                    </Link>
                  )}
                  <BlogCard.Content
                    category={
                      <Link
                        href={`/category/${article.category}`}
                        data-gtm="article_click_feature_recently_category"
                      >
                        {article.category}
                      </Link>
                    }
                    heading={
                      <Link
                        href={`/blog/${article.slug}`}
                        className="heading-link"
                        data-gtm="article_click_feature_recently_heading"
                      >
                        <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                          {article.title}
                        </h2>
                      </Link>
                    }
                    excerpt={article.excerpt ?? undefined}
                    avatar={
                      article.author && (
                        <Avatar>
                          <Avatar.Image
                            alt="author"
                            src={article.author.avatarUrl ?? undefined}
                          />
                        </Avatar>
                      )
                    }
                    date={article.releaseDate}
                    className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
                  />
                </BlogCard>
              </div>
            ))}
            {featuresPreviously.map((article) => (
              <BlogCard key={article.title} className="flex-col gap-spacious">
                {article.imageUrl && (
                  <Link
                    href={`/blog/${article.slug}`}
                    className="peer"
                    data-gtm="article_click_feature_previously_image"
                  >
                    <BlogCard.Media className="relative w-full h-[16rem]">
                      <CloudinaryImage
                        publicId={article.id}
                        src={article.imageUrl}
                        alt="media"
                        className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform"
                        fill
                        sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1280px) 22rem, 28rem"
                        quality={30}
                      />
                    </BlogCard.Media>
                  </Link>
                )}
                <BlogCard.Content
                  category={
                    <Link
                      href={`/category/${article.category}`}
                      data-gtm="article_click_feature_previously_category"
                    >
                      {article.category}
                    </Link>
                  }
                  heading={
                    <Link
                      href={`/blog/${article.slug}`}
                      className="heading-link"
                      data-gtm="article_click_feature_previously_heading"
                    >
                      <h2 className="text-heading-2 leading-heading-2 font-bold hover:text-base-black/80 hover:underline">
                        {article.title}
                      </h2>
                    </Link>
                  }
                  excerpt={article.excerpt ?? undefined}
                  avatar={
                    article.author && (
                      <Avatar>
                        <Avatar.Image
                          alt="author"
                          src={article.author.avatarUrl ?? undefined}
                        />
                      </Avatar>
                    )
                  }
                  date={article.releaseDate}
                  className="peer-hover:[&>.heading-link]:underline peer-hover:[&>.heading-link]:text-base-black/80"
                />
              </BlogCard>
            ))}
          </div>
        </PageLayout.Content>
        <PageLayout.Aside colStart={10} colEnd={13}>
          <Sidebar />
        </PageLayout.Aside>
      </PageLayout.Row>
      <div className="flex justify-center col-span-full">
        <Pagination count={totalPages} />
      </div>
    </PageLayout>
  );
}
