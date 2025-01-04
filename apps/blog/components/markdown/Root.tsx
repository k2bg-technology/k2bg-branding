import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { Post } from '../../modules/domain/post/types';

interface Props {
  article: Post;
}

export async function Root(props: Props) {
  const { article } = props;

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
            className="text-header-1 leading-header-1 font-bold"
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-7 text-header-2 leading-header-2 font-bold"
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-4 text-header-3 leading-header-3 font-bold"
          >
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className="first:mt-0 mt-2 text-body-r-sm leading-body-r-sm text-base-black/80 text-justify"
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
              className={className || 'mt-2 list-disc list-inside'}
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
                'text-body-r-sm leading-body-r-sm text-base-black/80 text-justify'
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
            className="mt-2 font-bold leading-none underline decoration-8 underline-offset-[-0.2em] decoration-main-default/50"
          >
            {children}
          </span>
        ),
        pre: ({ children, ...props }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <pre {...props} className="first:mt-0 mt-2 border rounded-lg">
            {children}
          </pre>
        ),
        code: ({ children, ...props }) => {
          const { inline, className } = props;

          const language = className?.split('-')[1];

          if (inline)
            return (
              <code className="rounded-md bg-base-white/80 text-body-r-sm text-accent-dark inline-block mx-1 px-2 py-1 leading-none">
                {children}
              </code>
            );

          return typeof children?.[0] === 'string' ? (
            <SyntaxHighlighter
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
              codeTagProps={{
                className: 'text-body-r-sm font-original',
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
            className="first:mt-0 mt-2 border-l-4 border-slate-100 pl-2"
          >
            {children}
          </blockquote>
        ),
        img: ({ className, src, alt, width, height, node }) => {
          if (!(src && alt && width && height)) return null;

          const id = String(node.properties?.dataId) || '';
          const unoptimized = Boolean(node.properties?.dataUnoptoinized);

          return (
            <CloudinaryImage
              publicId={id}
              className={className || 'first:mt-0 mt-5 mx-auto'}
              src={src}
              alt={alt}
              width={Number(width)}
              height={Number(height)}
              quality={30}
              unoptimized={unoptimized}
            />
          );
        },
      }}
    >
      {article.content}
    </ReactMarkdown>
  );
}
