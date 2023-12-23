import Image from 'next/image';
import { BlogCard } from 'ui';

import { N2m } from '../modules/notion/n2m';
import Notion from '../modules/notion';
import Blog from '../modules/blog';
import NotionMarkdown from '../components/notion-markdown/NotionMarkdown';
import Sidebar from '../components/sidebar/Sidebar';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export default async function Page() {
  const notionMarkdownString =
    await new N2m().fetchNotionPageAndConvertMarkdownString(CONCEPT_PAGE_ID);
  const page = new Notion.Page(
    await new Notion.Fetcher().fetchPage(CONCEPT_PAGE_ID)
  );
  const article = new Blog.Article(page);

  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-12">
        <BlogCard className="flex-col gap-6">
          <BlogCard.Content
            heading={
              <h1 className="text-heading-1 font-bold">{article.title}</h1>
            }
            date={article.date}
          />
          <BlogCard.Media className="relative w-full h-[37.6rem]">
            {article.image && (
              <Image
                alt="media"
                src={article.image}
                className="aspect-square h-full w-full object-cover"
                fill
              />
            )}
          </BlogCard.Media>
        </BlogCard>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-12">
        <div className="col-start-1 col-end-10">
          <NotionMarkdown markdownString={notionMarkdownString} />
        </div>
        <div className="hidden xl:block col-start-10 col-end-13">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
