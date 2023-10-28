import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import ReactMarkdown from 'react-markdown';
import { Avatar, BlogCard } from 'ui';

const notion = new Client({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  auth: process.env.NOTION_TOKEN ?? '',
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

export default async function Page({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const mdblocks = await n2m.pageToMarkdown(searchParams.id);
  const mdString = n2m.toMarkdownString(mdblocks);

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
              <a href="https://example.com" target="_blank" rel="noreferrer">
                <h1 className="text-heading-1 font-bold">記事のタイトル</h1>
              </a>
            }
            excerpt="記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋..."
            avatar={
              <Avatar
                image={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Office"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  />
                }
                name="Kuroda Kentaro"
              />
            }
            date="September 30, 2023"
          />
          <BlogCard.Media>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Office"
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              />
            </a>
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
          {mdString.parent}
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
