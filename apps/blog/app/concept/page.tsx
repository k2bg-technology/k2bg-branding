import { Metadata } from 'next';

import { Markdown } from '../../components/markdown';
import Sidebar from '../../components/sidebar/Sidebar';
import { PageHeading } from '../../components/page-heading/PageHeading';
import * as Prisma from '../../modules/data-access/prisma';

const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export const metadata: Metadata = {
  title: 'コンセプトページ',
  alternates: {
    canonical: '/concept',
  },
};

export default async function Page() {
  const postRepository = new Prisma.Post.Repository();
  const article = await postRepository.getPost(CONCEPT_PAGE_ID);

  return (
    <>
      <div className="grid grid-cols-[subgrid] gap-12 col-span-full">
        <PageHeading article={article} />
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-span-full xl:col-start-2 xl:col-end-9">
          <Markdown article={article} />
        </div>
        <div className="hidden xl:flex col-start-9 col-end-12">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
