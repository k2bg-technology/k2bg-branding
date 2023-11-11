import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Avatar, BlogCard } from 'ui';

import { N2m } from '../../modules/notion/n2m';
import Notion from '../../modules/notion';
import Blog from '../../modules/blog';

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
    <div className="grid grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
      <div className="col-span-full">
        <BlogCard className="flex-col gap-6">
          <BlogCard.Content
            category={
              <a href="https://example.com" target="_blank" rel="noreferrer">
                プログラミング
              </a>
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
              />
            )}
          </BlogCard.Media>
        </BlogCard>
      </div>
      <div className="col-start-1 col-end-10">
        <ReactMarkdown
          components={{
            h1: ({ children, ...props }) => (
              <h1
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                className="text-heading-1 leading-heading-1 font-bold"
              >
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                className="pt-20 text-heading-2 leading-heading-2 font-bold"
              >
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                className="pt-12 text-heading-3 leading-heading-3 font-bold"
              >
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                className="pt-4 text-body-md leading-body-md text-color-base/80"
              >
                {children}
              </p>
            ),
          }}
        >
          {notionMarkdownString}
        </ReactMarkdown>
      </div>
      <article className="col-start-10 col-end-13 h-[500px] bg-slate-100">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt doloribus,
        eligendi rem perferendis provident error enim omnis quis fuga
        voluptatibus saepe vel dolore dignissimos temporibus quidem, ut quam
        minima. Autem!
      </article>
    </div>
  );
}
