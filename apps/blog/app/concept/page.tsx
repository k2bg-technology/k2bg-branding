import type { Metadata } from 'next';

import { Markdown } from '../../components/markdown';
import { PageHeading } from '../../components/page-heading/PageHeading';
import Sidebar from '../../components/sidebar/Sidebar';
import { createFetchPostUseCase } from '../../infrastructure/di';

const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'コンセプトページ',
  alternates: {
    canonical: '/concept',
  },
};

export default async function Page() {
  const fetchPost = createFetchPostUseCase();
  const { post: article } = await fetchPost.execute({ id: CONCEPT_PAGE_ID });

  return (
    <>
      <div className="grid grid-cols-[subgrid] gap-12 col-span-full">
        <PageHeading article={article} />
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
