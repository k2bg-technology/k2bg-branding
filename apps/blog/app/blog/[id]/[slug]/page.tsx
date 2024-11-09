import { Suspense } from 'react';

import Notion from '../../../modules/data-access/notion';
import Article from '../../../modules/domain/article';
import NotionMarkdown from '../../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../../components/sidebar/Sidebar';
import { ArticleHeading } from '../../../components/article-heading/ArticleHeading';
import { ArticleHeadingSkelton } from '../../../components/article-heading/ArticleHeadingSkelton';
import { NotionMarkdownSkelton } from '../../../components/notion-markdown/NotionMarkdownSkelton';

export const revalidate = 3600;

export async function generateStaticParams() {
  const database = await new Notion.Fetcher().fetchDatabase({
    filter: {
      and: [
        {
          property: 'status',
          status: {
            equals: 'published',
          },
        },
        {
          property: 'type',
          select: {
            equals: 'article',
          },
        },
      ],
    },
  });

  const pages = database.results.map((result) => new Notion.Page(result));
  const articles = new Article.List(pages);

  return articles.all.map((article) => ({
    id: article.id,
    slug: article.slug,
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
