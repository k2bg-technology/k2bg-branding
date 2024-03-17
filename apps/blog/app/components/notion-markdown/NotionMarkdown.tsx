/* eslint-disable react/no-unstable-nested-components */

'use client';

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Props {
  markdownString: string;
}

export default function NotionMarkdown(props: Props) {
  const { markdownString } = props;

  return (
    <ReactMarkdown
      className="markdown"
      // @ts-expect-error rehypeRaw, remarkGfm
      rehypePlugins={[rehypeRaw, remarkGfm]}
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
            className="first:mt-0 mt-20 text-heading-2 leading-heading-2 font-bold"
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-12 text-heading-3 leading-heading-3 font-bold"
          >
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-4 text-body-sm leading-body-sm text-base-black/80 text-justify"
          >
            {children}
          </p>
        ),
        a: ({ children, ...props }) => {
          const { href, className } = props;

          return (
            <Link
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              href={href || ''}
              rel="noopener noreferrer"
              target="_blank"
              className={className || 'underline hover:opacity-80'}
            >
              {children}
            </Link>
          );
        },
        ul: ({ children, ...props }) => {
          const { className } = props;

          return (
            <ul
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              className={className || 'mt-4 list-disc list-inside'}
            >
              {children}
            </ul>
          );
        },
        li: ({ children, ...props }) => {
          const { className } = props;

          return (
            <li
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              className={
                className ||
                'text-body-sm leading-body-sm text-base-black/80 text-justify'
              }
            >
              {children}
            </li>
          );
        },
        strong: ({ children, ...props }) => (
          <span
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="mt-6 font-bold leading-none bg-accent-light/50"
          >
            {children}
          </span>
        ),
        pre: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <pre {...props} className="first:mt-0 mt-4 border rounded-lg">
            {children}
          </pre>
        ),
        code: ({ children, ...props }) => {
          const { inline, className } = props;

          const language = className?.split('-')[1];

          if (inline)
            return (
              <code className="rounded-md bg-base-white/80 text-body-sm text-accent-dark inline-block mx-1 px-2 py-1 leading-none">
                {children}
              </code>
            );

          return typeof children?.[0] === 'string' ? (
            <SyntaxHighlighter
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              codeTagProps={{
                className: 'text-body-sm font-original',
              }}
              customStyle={{ padding: '1.5rem', borderRadius: '0.5rem' }}
              language={language}
              style={a11yDark}
              wrapLines
              wrapLongLines
            >
              {children?.[0]?.trim()}
            </SyntaxHighlighter>
          ) : null;
        },
        blockquote: ({ children, ...props }) => (
          <blockquote
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-4 border-l-4 border-slate-100 pl-4"
          >
            {children}
          </blockquote>
        ),
        img: ({ ...props }) => {
          const { className } = props;

          return (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              className={className || 'first:mt-0 mt-8 mx-auto'}
            />
          );
        },
      }}
    >
      {markdownString}
    </ReactMarkdown>
  );
}
