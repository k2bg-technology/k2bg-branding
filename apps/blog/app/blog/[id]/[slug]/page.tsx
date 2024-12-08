import { Suspense } from 'react';

import NotionMarkdown from '../../../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { ArticleHeading } from '../../../../components/article-heading/ArticleHeading';
import { ArticleHeadingSkelton } from '../../../../components/article-heading/ArticleHeadingSkelton';
import { NotionMarkdownSkelton } from '../../../../components/notion-markdown/NotionMarkdownSkelton';
import * as Prisma from '../../../../modules/data-access/prisma';

export const revalidate = 3600;

export async function generateStaticParams() {
  const postRepository = new Prisma.PostRepository();
  const posts = await postRepository.getAllArticleSlugs();

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: { id: string; slug: string };
}) {
  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full">
        <Suspense fallback={<ArticleHeadingSkelton />}>
          <ArticleHeading articleId={params.id} />
        </Suspense>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-start-1 col-end-10">
          <Suspense fallback={<NotionMarkdownSkelton />}>
            <NotionMarkdown articleId={params.id} />
          </Suspense>
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
