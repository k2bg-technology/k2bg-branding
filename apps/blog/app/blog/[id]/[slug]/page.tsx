import { Metadata } from 'next';

import { Markdown } from '../../../../components/markdown';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { ArticleHeading } from '../../../../components/article-heading/ArticleHeading';
import * as Prisma from '../../../../modules/data-access/prisma';

type Params = Promise<{ id: string; slug: string }>;

interface Props {
  params: Params;
}

export async function generateStaticParams() {
  const postRepository = new Prisma.Post.Repository();
  const posts = await postRepository.getAllArticleSlugs();

  return posts.map((post: { id: string; slug: string }) => ({
    id: post.id,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const postRepository = new Prisma.Post.Repository();
  const article = await postRepository.getPost(id);

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

  const postRepository = new Prisma.Post.Repository();
  const article = await postRepository.getPost(id);

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
