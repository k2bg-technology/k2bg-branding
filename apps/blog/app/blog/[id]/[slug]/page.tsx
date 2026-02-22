import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleHeading } from '../../../../components/article-heading/ArticleHeading';
import { Markdown } from '../../../../components/markdown';
import { PageLayout } from '../../../../components/page-layout';
import { ScrollToTopButton } from '../../../../components/scroll-to-top-button/ScrollToTopButton';
import { Sidebar } from '../../../../components/sidebar/Sidebar';
import {
  extractHeadings,
  TableOfContents,
} from '../../../../components/table-of-contents';
import {
  createFetchAllSlugsUseCase,
  createFetchPostUseCase,
  getDefaultOgImageUrl,
} from '../../../../infrastructure/di';

export const revalidate = 3600;

type Params = Promise<{ id: string; slug: string }>;

interface Props {
  params: Params;
}

export async function generateStaticParams() {
  const fetchAllSlugs = createFetchAllSlugsUseCase();
  const { slugs } = await fetchAllSlugs.execute();

  return slugs.map((slug) => ({
    id: slug.id,
    slug: slug.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const fetchPost = createFetchPostUseCase();
  const { post: article } = await fetchPost.execute({ id });

  const ogImageUrl = article.ogImageUrl ?? getDefaultOgImageUrl();

  return {
    title: article.title,
    description: article.excerpt || '',
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      locale: 'ja_JP',
      siteName: 'K2.B.G Technology Blog',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      publishedTime: article.releaseDate,
      authors: article.author ? [article.author.name] : undefined,
      tags: article.tags.length > 0 ? [...article.tags] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const fetchPost = createFetchPostUseCase();

  const { post: article } = await fetchPost.execute({ id }).catch(() => {
    notFound();
  });

  return (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <TableOfContents headings={extractHeadings(article.content)} />
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
      <PageLayout.Row>
        <ArticleHeading article={article} />
      </PageLayout.Row>
      <PageLayout.Row>
        <PageLayout.Content className="xl:col-start-2 xl:col-end-9">
          <Markdown content={article.content} />
        </PageLayout.Content>
        <PageLayout.Aside colStart={9} colEnd={12}>
          <Sidebar />
        </PageLayout.Aside>
      </PageLayout.Row>
    </PageLayout>
  );
}
