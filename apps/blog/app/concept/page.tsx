import Image from 'next/image';
import { BlogCard } from 'ui';

import { N2m } from '../modules/data-access/notion/n2m';
import Notion from '../modules/data-access/notion';
import Article from '../modules/domain/article';
import NotionMarkdown from '../components/notion-markdown/NotionMarkdown';
import Sidebar from '../components/sidebar/Sidebar';
import { convertImageExternalToLocal } from '../modules/utility/convertImageExternalToLocal';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const CONCEPT_PAGE_ID = process.env.NOTION_CONCEPT_PAGE_ID ?? '';

export default async function Page() {
  const notionMarkdownString =
    await new N2m().fetchNotionPageAndConvertMarkdownString(CONCEPT_PAGE_ID);
  const page = new Notion.Page(
    await new Notion.Fetcher().fetchPage(CONCEPT_PAGE_ID)
  );
  const article = new Article.Single(page);

  if (article.image)
    await convertImageExternalToLocal(article.image, article.id);

  const placeholder = await article.imagePlaceholder;

  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-12">
        <BlogCard className="flex-col gap-6">
          <BlogCard.Content
            heading={
              <h1 className="text-header-1 font-bold">{article.title}</h1>
            }
          />
          <BlogCard.Media className="relative w-full h-[37.6rem]">
            {article.image && (
              <Image
                alt="media"
                src={`/images/${article.id}`}
                className="aspect-square h-full w-full object-cover"
                fill
                placeholder="blur"
                blurDataURL={placeholder}
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
