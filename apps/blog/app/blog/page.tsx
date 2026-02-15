import type { Metadata } from 'next';
import Link from 'next/link';
import { Avatar } from 'ui';

import { BlogCard } from '../../components/blog-card';
import { CloudinaryImage } from '../../components/cloudinary-image/CloudinaryImage';
import { PageLayout } from '../../components/page-layout';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';
import { Sidebar } from '../../components/sidebar/Sidebar';
import {
  createFetchPostsUseCase,
  getDefaultOgImageUrl,
} from '../../infrastructure/di';

const PAGE_SIZE = 8;

export const revalidate = 60;

const defaultOgImageUrl = getDefaultOgImageUrl();

const blogDescription =
  'エンジニアでなくてもテクノロジーを活用できる —— そんな情報を発信するブログです。非IT出身からエンジニアへ転身した筆者が、プログラミング・AI・自動化・UI/UXなど幅広いテーマを、わかりやすく解説します。';

export const metadata: Metadata = {
  title: 'K2.B.G Technology Blog',
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
    title: 'K2.B.G Technology Blog',
    description: blogDescription,
    type: 'website',
    locale: 'ja_JP',
    siteName: 'K2.B.G Technology Blog',
    images: [{ url: defaultOgImageUrl, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K2.B.G Technology Blog',
    description: blogDescription,
    images: [defaultOgImageUrl],
  },
  alternates: {
    canonical: '/blog',
  },
};

export default async function Page() {
  const fetchPosts = createFetchPostsUseCase();
  const { items: articles } = await fetchPosts.execute({ pageSize: PAGE_SIZE });

  const featureLatest = articles.at(0);
  const featuresRecently = articles.slice(1, 3);
  const featuresPreviously = articles.slice(4, 8);

  return (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
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
                      sizes="100%"
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
                      sizes="100%"
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
                          sizes="100%"
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
                        sizes="100%"
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
    </PageLayout>
  );
}
