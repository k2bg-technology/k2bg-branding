import { Markdown } from '../../components/markdown';
import Sidebar from '../../components/sidebar/Sidebar';
import { PageHeading } from '../../components/page-heading/PageHeading';
import * as Prisma from '../../modules/data-access/prisma';

const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export default async function Page() {
  const postRepository = new Prisma.Post.Repository();
  const article = await postRepository.getPost(CONCEPT_PAGE_ID);

  return (
    <>
      <div className="grid-cols-[subgrid] gap-12 col-span-full">
        <PageHeading article={article} />
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full">
        <div className="col-start-1 col-end-10">
          <Markdown article={article} />
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
