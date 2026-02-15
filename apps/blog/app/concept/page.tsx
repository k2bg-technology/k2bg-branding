import type { Metadata } from 'next';

import { Markdown } from '../../components/markdown';
import { PageHeading } from '../../components/page-heading/PageHeading';
import { PageLayout } from '../../components/page-layout';
import { ScrollToTopButton } from '../../components/scroll-to-top-button/ScrollToTopButton';
import { Sidebar } from '../../components/sidebar/Sidebar';
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
    <PageLayout
      fab={
        <PageLayout.Fab>
          <ScrollToTopButton />
        </PageLayout.Fab>
      }
    >
      <PageLayout.Row>
        <PageHeading article={article} />
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
