import { Suspense } from 'react';

import NotionMarkdown from '../components/notion-markdown/NotionMarkdown';
import Sidebar from '../components/sidebar/Sidebar';
import { PageHeading } from '../components/page-heading/PageHeading';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export default async function Page() {
  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-12">
        <Suspense key={CONCEPT_PAGE_ID} fallback={<p>Loading...</p>}>
          <PageHeading articleId={CONCEPT_PAGE_ID} />
        </Suspense>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="col-start-1 col-end-10">
          <Suspense key={CONCEPT_PAGE_ID} fallback={<p>Loading...</p>}>
            <NotionMarkdown articleId={CONCEPT_PAGE_ID} />
          </Suspense>
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
