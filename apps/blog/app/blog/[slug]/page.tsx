import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import ReactMarkdown from 'react-markdown';

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
    <ReactMarkdown
      components={{
        h1: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <h1 {...props} className="text-heading-1 leading-heading-1">
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <h2 {...props} className="text-heading-2 leading-heading-2">
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <h2 {...props} className="text-heading-3 leading-heading-3">
            {children}
          </h2>
        ),
        p: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <p {...props} className="text-body-sm leading-body-sm">
            {children}
          </p>
        ),
      }}
    >
      {mdString.parent}
    </ReactMarkdown>
  );
}
