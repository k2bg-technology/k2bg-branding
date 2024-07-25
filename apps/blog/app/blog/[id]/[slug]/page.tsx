import { Suspense } from 'react';

import Notion from '../../../modules/data-access/notion';
import Article from '../../../modules/domain/article';
import NotionMarkdown from '../../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../../components/sidebar/Sidebar';
import { ArticleHeading } from '../../../components/article-heading/ArticleHeading';

const fetchDatabase = async () => {
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

  return database;
};

export async function generateStaticParams() {
  const database = await fetchDatabase();
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
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
        <Suspense fallback={<p>Loading...</p>}>
          <ArticleHeading articleId={params.id} />
        </Suspense>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
        <div className="col-start-1 col-end-10">
          <Suspense fallback={<p>Loading...</p>}>
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
