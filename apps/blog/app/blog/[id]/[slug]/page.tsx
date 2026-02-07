import type { Metadata } from 'next';
import { ArticleHeading } from '../../../../components/article-heading/ArticleHeading';
import { Markdown } from '../../../../components/markdown';
import { Sidebar } from '../../../../components/sidebar/Sidebar';
import {
  createFetchAllSlugsUseCase,
  createFetchPostUseCase,
} from '../../../../infrastructure/di';

export const revalidate = 60;

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

  return {
    title: article.title,
    description: article.excerpt || '',
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const fetchPost = createFetchPostUseCase();
  const { post: article } = await fetchPost.execute({ id });

  return (
    <>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <ArticleHeading article={article} />
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-span-full xl:col-start-2 xl:col-end-9">
          <Markdown content={article.content} />
        </div>
        <div className="hidden xl:flex col-start-9 col-end-12">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
