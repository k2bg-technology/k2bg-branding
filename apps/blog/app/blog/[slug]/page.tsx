import Image from 'next/image';
import Link from 'next/link';
import { Avatar, BlogCard } from 'ui';

import { N2m } from '../../modules/notion/n2m';
import Notion from '../../modules/notion';
import Blog from '../../modules/blog';
import NotionMarkdown from '../../components/notion-markdown/NotionMarkdown';
import Sidebar from '../../components/sidebar/Sidebar';

export default async function Page({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const notionMarkdownString =
    await new N2m().fetchNotionPageAndConvertMarkdownString(searchParams.id);
  const page = new Notion.Page(
    await new Notion.Fetcher().fetchPage(searchParams.id)
  );
  const article = new Blog.Article(page);

  return (
    <>
      <div className="grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
        <BlogCard className="flex-col gap-6">
          <BlogCard.Content
            category={
              <Link href={`/category/${article.category}`}>
                {article.category}
              </Link>
            }
            heading={
              <h1 className="text-heading-1 font-bold">{article.title}</h1>
            }
            excerpt={article.excerpt}
            avatar={
              <Avatar
                image={
                  <div className="relative w-full h-full">
                    <Image
                      alt="author"
                      src={article.avatar.imageUrl}
                      className="aspect-square h-full w-full object-cover"
                      fill
                      sizes="100%"
                    />
                  </div>
                }
                name={article.avatar.name}
              />
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
                sizes="100%"
              />
            )}
          </BlogCard.Media>
        </BlogCard>
      </div>
      <div className="grid grid-cols-[subgrid] col-span-full py-[30px]">
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
